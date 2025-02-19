import sys
import json
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import io
import base64

def optimize_portfolio(risk_aversion, time_period):
    symbols = [
        '0P0000XVUB.BO',
        '0P0000XV5S.BO',
        '0P0000XVK2.BO',
        '0P0000XVJK.BO',
        '0P0000XVU2.BO',
        '0P0001IAU9.BO'
    ]
    
    # Attempt to download data
    try:
        data = yf.download(symbols, start="2020-01-01", end="2025-02-02")['Close']
        if data.empty:
            raise ValueError("No data was downloaded from Yahoo Finance.")
    except Exception as e:
        return {"error": f"Data download failed: {str(e)}"}

    try:
        data = data.fillna(method='ffill').dropna()
    except Exception as e:
        return {"error": f"Data processing failed: {str(e)}"}
    
    if data.empty:
        return {"error": "Data is empty after filling missing values."}
    
    try:
        log_returns = np.log(data / data.shift(1)).dropna()
        trading_days = 252
        mean_returns = np.exp(log_returns.mean() * trading_days) - 1
        cov_matrix = log_returns.cov() * trading_days
    except Exception as e:
        return {"error": f"Calculations failed: {str(e)}"}
    
    num_portfolios = 10000
    A = float(risk_aversion)  # Convert 0-10 scale to appropriate value
    max_investment_horizon = 30
    target_safe_allocation = (max_investment_horizon - float(time_period)) / max_investment_horizon
    
    # Portfolio optimization (simplified)
    results = []
    weights_record = []
    for _ in range(num_portfolios):
        weights = np.random.random(len(symbols))
        weights /= np.sum(weights)
        portfolio_return = np.dot(weights, mean_returns)
        portfolio_stddev = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        safe_allocation = weights[0] + weights[1]
        penalty = 10 * max(0, target_safe_allocation - safe_allocation)**2
        utility = portfolio_return - 0.5 * A * portfolio_stddev**2 - penalty
        
        results.append([
            portfolio_return,
            portfolio_stddev,
            portfolio_return / portfolio_stddev if portfolio_stddev != 0 else 0,
            utility
        ])
        weights_record.append(weights)
    
    results_frame = pd.DataFrame(
        results, columns=['Return', 'Volatility', 'Sharpe Ratio', 'Utility']
    )
    max_utility_idx = results_frame['Utility'].idxmax()
    optimal_portfolio = results_frame.loc[max_utility_idx]
    optimal_weights = weights_record[max_utility_idx]
    
    # Generate plot and encode as base64
    try:
        plt.figure(figsize=(10, 6))
        plt.scatter(
            results_frame['Volatility'],
            results_frame['Return'],
            c=results_frame['Sharpe Ratio'],
            cmap='YlGnBu',
            marker='o',
            alpha=0.3
        )
        plt.scatter(
            optimal_portfolio['Volatility'],
            optimal_portfolio['Return'],
            marker='*',
            color='r',
            s=500,
            label='Optimal Portfolio'
        )
        plt.colorbar(label='Sharpe Ratio')
        plt.xlabel('Volatility')
        plt.ylabel('Expected Return')
        plt.title('Efficient Frontier')
        plt.legend()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()
    except Exception as e:
        return {"error": f"Plotting failed: {str(e)}"}
    
    # Get asset names and allocations
    asset_names = []
    asset_allocations = []
    for symbol, weight in zip(symbols, optimal_weights):
        asset_names.append(symbol)
        asset_allocations.append(round(weight * 100, 2))
    
    return {
        'expected_return': round(optimal_portfolio['Return'] * 100, 2),
        'volatility': round(optimal_portfolio['Volatility'] * 100, 2),
        'sharpe_ratio': round(optimal_portfolio['Sharpe Ratio'], 2),
        'plot': plot_base64,
        'allocations': dict(zip(asset_names, asset_allocations))
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Two arguments required: risk_aversion and time_period"}))
        sys.exit(1)
    risk_aversion = sys.argv[1]
    time_period = sys.argv[2]
    result = optimize_portfolio(risk_aversion, time_period)
    if 'error' in result:
        print(json.dumps(result))
        sys.exit(1)
    print(json.dumps(result))
