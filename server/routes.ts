import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      res.status(401).send("Unauthorized");
      return;
    }
    next();
  };

  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      res.status(404).send("Project not found");
      return;
    }
    res.json(project);
  });

  // Protected routes
  app.get("/api/credits", requireAuth, async (req, res) => {
    const credits = await storage.getUserCredits(req.user!.id);
    res.json(credits);
  });

  app.post("/api/trade", requireAuth, async (req, res) => {
    try {
      const { projectId, amount, type } = req.body;

      if (!projectId || !amount || !type) {
        res.status(400).send("Missing required fields");
        return;
      }

      const project = await storage.getProject(parseInt(projectId));

      if (!project) {
        res.status(404).send("Project not found");
        return;
      }

      const totalCost = (Number(amount) * Number(project.price)).toString();

      if (type === "buy" && Number(req.user!.balance) < Number(totalCost)) {
        res.status(400).send("Insufficient balance");
        return;
      }

      const newBalance = type === "buy"
        ? (Number(req.user!.balance) - Number(totalCost)).toString()
        : (Number(req.user!.balance) + Number(totalCost)).toString();

      await storage.updateUserBalance(req.user!.id, newBalance);

      const credit = await storage.createCredit({
        projectId,
        userId: req.user!.id,
        amount,
        price: project.price,
        type,
        timestamp: new Date(),
      });

      res.json(credit);
    } catch (error) {
      console.error('Trade error:', error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}