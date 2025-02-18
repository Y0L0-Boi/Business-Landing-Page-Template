import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf

# List your 6 symbols manually; ensure the first two are safe assets (e.g., bond ETFs)
symbols = [
    '0P0000XVUB.BO',
    '0P0000XV5S.BO',
    '0P0000XVK2.BO',
    '0P0000XVJK.BO',
    '0P0000XVU2.BO',
    '0P0001IAU9.BO'
]

# Download historical data for 6 assets
data = yf.download(symbols, start="2020-01-01", end="2025-02-02")
print("Downloaded data columns:", data.columns)

# Use 'Close' prices instead of 'Adj Close'
if 'Close' in data.columns:
    data = data['Close']
else:
    raise KeyError("'Close' not found in the downloaded data")

# View the downloaded data (first 5 rows)
print("Downloaded data preview:")
print(data.head())

# Save the downloaded data as a CSV file in your folder


# Fill missing data using forward fill so that all symbols are retained
data = data.fillna(method='ffill')

# Count the number of rows before dropping missing data
rows_before = data.shape[0]

# Automatically exclude dates on which any field is empty
data = data.dropna()

# Count the number of rows dropped and print it
rows_after = data.shape[0]
print(f"Number of dates dropped by dropna(): {rows_before - rows_after}")



# Verify that the data contains the expected number of columns
if data.shape[1] != len(symbols):
    raise ValueError(f"Expected data for {len(symbols)} assets, but got {data.shape[1]} columns.")

# Calculate daily log returns
log_returns = np.log(data / data.shift(1)).dropna()

# Annualize mean log returns and covariance matrix
trading_days = 252
annual_log_mean = log_returns.mean() * trading_days
# Convert annualized log returns to annualized compound returns
mean_returns = np.exp(annual_log_mean) - 1

cov_matrix = log_returns.cov() * trading_days

# Ensure number of assets is 6
num_assets = len(mean_returns)
if num_assets != 6:
    raise ValueError(f"Filtered data has {num_assets} assets instead of the expected 6.")

# Portfolio simulation parameters
num_portfolios = 1000000
A = 2.0  # risk aversion index

# Define glide path parameters
max_investment_horizon = 30  # maximum horizon in years (e.g., full career)
current_horizon = 5          # current remaining investment horizon in years
target_safe_allocation = (max_investment_horizon - current_horizon) / max_investment_horizon
glide_penalty_factor = 10

# Set up arrays to hold results
results = np.zeros((4, num_portfolios))
weights_record = []

for i in range(num_portfolios):
    # Generate random weights for 6 assets
    weights = np.random.random(num_assets)
    weights /= np.sum(weights)
    
    # Calculate portfolio return and volatility
    portfolio_return = np.dot(weights, mean_returns)
    portfolio_stddev = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    
    # Calculate safe allocation as the sum of allocations for the first two assets
    safe_allocation = weights[0] + weights[1]
    
    # Penalize if safe allocation is below the target safe allocation
    penalty = glide_penalty_factor * max(0, target_safe_allocation - safe_allocation)**2
    
    # Updated utility function
    utility = portfolio_return - 0.5 * A * portfolio_stddev**2 - penalty
    
    # Store results: [Return, Volatility, Sharpe Ratio, Utility]
    results[0, i] = portfolio_return
    results[1, i] = portfolio_stddev
    results[2, i] = portfolio_return / portfolio_stddev  # Sharpe Ratio
    results[3, i] = utility
    
    weights_record.append(weights)

# Convert results to a DataFrame
results_frame = pd.DataFrame(results.T, columns=['Return', 'Volatility', 'Sharpe Ratio', 'Utility'])

# Locate the portfolio with the maximum utility
max_utility_idx = results_frame['Utility'].idxmax()
max_utility_port = results_frame.loc[max_utility_idx]
max_utility_weights = weights_record[max_utility_idx]

# Plot the efficient frontier
plt.scatter(
    results_frame['Volatility'],
    results_frame['Return'],
    c=results_frame['Sharpe Ratio'],
    cmap='YlGnBu',
    marker='o'
)
plt.title('Efficient Frontier')
plt.xlabel('Volatility')
plt.ylabel('Return')
plt.colorbar(label='Sharpe Ratio')

# Red star for max utility portfolio
plt.scatter(
    max_utility_port['Volatility'],
    max_utility_port['Return'],
    marker='*',
    color='r',
    s=500,
    label='Max Utility'
)
plt.legend()
plt.show()

# Print the best portfolio allocation details
print("Max Utility Portfolio Allocation\n")
print("Return:", max_utility_port['Return'])
print("Volatility:", max_utility_port['Volatility'])
print("Sharpe Ratio:", max_utility_port['Sharpe Ratio'])
print("Utility:", max_utility_port['Utility'])
print("Allocation:")
for i, symbol in enumerate(data.columns):
    asset_info = yf.Ticker(symbol).info
    asset_name = asset_info.get('shortName', 'Unknown')
    print(f"{asset_name} ({symbol}): {max_utility_weights[i] * 100:.2f}%")
