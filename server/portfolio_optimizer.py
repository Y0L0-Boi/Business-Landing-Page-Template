import sys
import json
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import cvxpy as cp
from sklearn.covariance import LedoitWolf
import io
import base64

def fetch_financial_data(symbols):
    """Fetch and preprocess financial data with error handling"""
    try:
        data = yf.download(symbols, start="2020-01-01", end="2025-02-02", auto_adjust=True)['Close']
        if data.empty:
            raise ValueError("No data downloaded")
        return data.fillna(method='ffill').dropna()
    except Exception as e:
        raise RuntimeError(f"Data fetch failed: {str(e)}")

def calculate_risk_metrics(data):
    """Calculate annualized returns and regularized covariance matrix"""
    log_returns = np.log(data / data.shift(1)).dropna()
    trading_days = 252
    
    # Geometric mean returns for long-term stability
    mean_returns = np.exp(log_returns.mean() * trading_days) - 1
    
    # Regularized covariance matrix
    cov_matrix = LedoitWolf().fit(log_returns).covariance_ * trading_days
    
    return mean_returns.values, cov_matrix

def optimize_portfolio(risk_aversion, time_period):
    # Input validation
    if not (0 <= float(risk_aversion) <= 10):
        return {"error": "Risk aversion must be between 0 and 10"}
    if not (0 <= float(time_period) <= 30):
        return {"error": "Time period must be between 0 and 30 years"}
    
    symbols = [
        '0P0000XVUB.BO',
        '0P0000XV5S.BO', 
        '0P0000XVK2.BO',
        '0P0000XVJK.BO',
        '0P0000XVU2.BO',
        '0P0001IAU9.BO'
    ]
    
    try:
        data = fetch_financial_data(symbols)
        mean_returns, cov_matrix = calculate_risk_metrics(data)
        
        # Convex optimization setup
        weights = cp.Variable(len(symbols))
        target_safe = (30 - float(time_period)) / 30  # 0-30 year horizon
        
        # Dynamic safe asset selection (lowest volatility)
        volatilities = np.sqrt(np.diag(cov_matrix))
        safe_assets = volatilities.argsort()[:2]
        
        # Optimization constraints
        constraints = [
            cp.sum(weights) == 1,
            weights >= 0,
            cp.sum(weights[safe_assets]) >= target_safe
        ]
        
        # Objective function
        portfolio_return = mean_returns @ weights
        portfolio_volatility = cp.quad_form(weights, cov_matrix)
        utility = portfolio_return - 0.5 * float(risk_aversion) * portfolio_volatility
        
        problem = cp.Problem(cp.Maximize(utility), constraints)
        problem.solve()
        
        if problem.status != 'optimal':
            raise RuntimeError("Optimization failed to converge")
        
        # Process results
        optimal_weights = weights.value.round(4)
        allocations = {sym: round(w*100, 2) for sym, w in zip(symbols, optimal_weights)}
        
        return {
            'expected_return': round(portfolio_return.value*100, 2),
            'volatility': round(np.sqrt(portfolio_volatility.value)*100, 2),
            'sharpe_ratio': round((portfolio_return.value/np.sqrt(portfolio_volatility.value)), 2),
            'allocations': allocations
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Requires risk_aversion (0-10) and time_period (0-30)"}))
        sys.exit(1)
        
    result = optimize_portfolio(sys.argv[1], sys.argv[2])
    print(json.dumps(result))
