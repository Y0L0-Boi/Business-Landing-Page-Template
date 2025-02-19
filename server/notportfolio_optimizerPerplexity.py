import sys
import json
import numpy as np
import pandas as pd
import yfinance as yf
import cvxpy as cp
from sklearn.covariance import LedoitWolf

def fetch_financial_data(symbols):
    """Fetch and preprocess financial data with enhanced error handling"""
    try:
        print("Fetching financial data...")
        data = yf.download(symbols, start="2020-01-01", end="2025-02-02", auto_adjust=True)['Close']
        if data.empty:
            raise ValueError("No data downloaded")
        # Instead of raising an error when missing values are found,
        # fill missing values and drop any remaining NaNs.
        data = data.ffill().dropna()
        print("Financial data fetched successfully.")
        return data
    except Exception as e:
        raise RuntimeError(f"Data fetch failed: {str(e)}")

def calculate_risk_metrics(data):
    """Calculate advanced risk metrics with momentum scoring"""
    print("Calculating risk metrics...")
    log_returns = np.log(data / data.shift(1)).dropna()
    trading_days = 252
    
    # Calculate momentum (90-day returns)
    momentum = data.pct_change(90).iloc[-1].values
    
    # Enhanced return estimation
    mean_returns = np.exp(log_returns.mean() * trading_days) - 1
    
    # Regularized covariance matrix
    cov_matrix = LedoitWolf().fit(log_returns).covariance_ * trading_days
    print("Risk metrics calculated successfully.")
    return mean_returns, cov_matrix, momentum

def optimize_portfolio(risk_aversion, time_period):
    # Input validation with enhanced checks
    try:
        risk_aversion = np.clip(float(risk_aversion), 0, 10)
        time_period = np.clip(float(time_period), 0, 30)
    except ValueError:
        return {"error": "Invalid input values"}

    symbols = [
        '0P0000XVUB.BO',
        '0P0000XV5S.BO',
        '0P0000XVK2.BO',
        '0P0000XVJK.BO',
        '0P0000XVU2.BO',
        '0P0001IAU9.BO'
    ]

    try:
        print("Starting portfolio optimization...")
        data = fetch_financial_data(symbols)
        mean_returns, cov_matrix, momentum = calculate_risk_metrics(data)
        
        # Optimization setup
        n_assets = len(symbols)
        weights = cp.Variable(n_assets)
        prev_weights = np.ones(n_assets) / n_assets
        
        # Dynamic safety calculation
        volatilities = np.sqrt(np.diag(cov_matrix))
        safety_score = 0.4 * volatilities + 0.6 * momentum
        safe_indices = list(safety_score.argsort()[:3])  # Convert to Python list
        target_safe = (30 - time_period) / 30

        # Market regime detection
        market_vol = np.mean(volatilities)
        regime_factor = 1 - (market_vol / np.max(volatilities))

        # Basic constraints
        constraints = [
            cp.sum(weights) == 1,  # Sum of weights = 1
            weights >= 0,          # No short selling
        ]
        
        # Safe assets constraint using explicit sum
        safe_sum = sum(weights[i] for i in safe_indices)
        constraints.append(safe_sum >= target_safe)
        
        # Sector constraint using explicit sum for first two assets
        tech_sum = weights[0] + weights[1]
        constraints.append(tech_sum <= 0.3)
        
        # Momentum and turnover constraints
        constraints.append(weights @ momentum >= 0.25)
        constraints.append(cp.norm(weights - prev_weights, 1) <= 0.15)

        # Risk parity constraint
        risk_contributions = cp.multiply(weights, cov_matrix @ weights)
        constraints.append(cp.sum(risk_contributions) <= 0.25)

        # Adaptive objective function
        portfolio_return = mean_returns @ weights
        portfolio_volatility = cp.quad_form(weights, cov_matrix)
        
        # Solve optimization
        print("Solving optimization problem...")
        problem = cp.Problem(cp.Maximize(utility), constraints)
        problem.solve(solver=cp.ECOS)
        
        if problem.status not in ['optimal', 'optimal_inaccurate']:
            raise RuntimeError(f"Optimization failed: {problem.status}")

        # Process results
        optimal_weights = np.maximum(weights.value, 0)  # Remove negative weights
        optimal_weights /= np.sum(optimal_weights)  # Re-normalize

        print("Optimization successful. Processing results...")
        
        # Convert numpy types to Python native types for JSON serialization
        result = {
            'status': 'success',
            'data': {
                'expected_return': float(round(np.dot(mean_returns, optimal_weights) * 100, 2)),
                'volatility': float(round(np.sqrt(optimal_weights @ cov_matrix @ optimal_weights) * 100, 2)),
                'sharpe_ratio': float(round(np.dot(mean_returns, optimal_weights) / 
                                          np.sqrt(optimal_weights @ cov_matrix @ optimal_weights), 2)),
                'allocations': {str(sym): float(round(w * 100, 2)) 
                              for sym, w in zip(symbols, optimal_weights)},
                'market_regime': "Low Volatility" if regime_factor > 0.7 else "High Volatility"
            }
        }
        
        # Validate JSON serialization
        try:
            json.dumps(result)
            return result
        except TypeError as e:
            print(f"JSON serialization error: {str(e)}")
            return {
                "status": "error",
                "message": f"JSON serialization error: {str(e)}"
            }

    except Exception as e:
        print(f"Optimization error: {str(e)}")
        return {"error": f"Optimization error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Requires risk_aversion (0-10) and time_period (0-30)"}))
        sys.exit(1)
    
    print("Starting main execution...")
    result = optimize_portfolio(sys.argv[1], sys.argv[2])
    print("Optimization completed. Printing result...")
    print(json.dumps(result))
    print("Exiting main execution.")
