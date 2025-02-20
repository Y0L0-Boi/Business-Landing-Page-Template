import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { spawn } from "child_process"; // <-- Added import

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

  app.post("/api/clients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const newClient = await storage.createClient({
        ...req.body,
        userId: req.user.id,
        createdAt: new Date(),
      });
      res.json(newClient);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
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
      // Use the imported spawn instead of require
      const python = spawn("python3", [
        "server/portfolio_optimizer.py",
        riskLevel,
        timeFrame,
      ]);

      let result = "";
      let errorOutput = "";

      python.stdout.on("data", (data: Buffer) => {
        result += data.toString();
      });

      python.stderr.on("data", (data: Buffer) => {
        errorOutput += data.toString();
      });

      python.on("close", (code: number) => {
        console.log("Raw Python output:", result);
        if (code !== 0) {
          console.error("Python script error:", errorOutput);
          return res.status(422).json({
            message: "Portfolio optimization failed",
            details: errorOutput || "Unknown error occurred",
          });
        }
        try {
          const optimizedResult = JSON.parse(result);
          res.json(optimizedResult);
        } catch (parseError) {
          console.error("Failed to parse Python output:", parseError);
          return res.status(500).json({
            message: "Invalid response format from optimizer",
            details: result,
          });
        }
      });
    } catch (error: any) {
      console.error("Server error during optimization:", error);
      res.status(500).json({
        message: "Failed to optimize portfolio",
        details: error.toString(),
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}