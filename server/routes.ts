import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Dashboard API routes
  app.get("/api/clients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const clients = await storage.getClientsWithPortfolio(req.user.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/portfolio/summary", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const summary = await storage.getPortfolioSummary(req.user.id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  app.post("/api/optimize-portfolio", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.sendStatus(401);
    }

    try {
      const { riskLevel, timeFrame } = req.body;
      const { spawn } = require('child_process');
      const python = spawn('python3', ['server/portfolio_optimizer.py', riskLevel, timeFrame]);
      
      let result = '';
      
      python.stdout.on('data', (data) => {
        result += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          res.status(500).json({ message: "Portfolio optimization failed" });
          return;
        }
        res.json(JSON.parse(result));
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to optimize portfolio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}