import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTaskLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // GET /api/users → list users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // POST /api/users → add user
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create user' });
      }
    }
  });

  // DELETE /api/users/:name → delete user
  app.delete('/api/users/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const deleted = await storage.deleteUser(name);
      
      if (deleted) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // GET /api/tasks/:user → get tasks for a user
  app.get('/api/tasks/:user', async (req, res) => {
    try {
      const { user } = req.params;
      const userData = await storage.getUser(user);
      
      if (userData) {
        res.json({ tasks: userData.tasks });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // POST /api/tasks/:user → update tasks for a user
  app.post('/api/tasks/:user', async (req, res) => {
    try {
      const { user } = req.params;
      const { tasks } = req.body;
      
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ message: 'Tasks must be an array' });
      }
      
      const updatedUser = await storage.updateUserTasks(user, tasks);
      
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to update tasks' });
    }
  });

  // POST /api/logs → add a new task log
  app.post('/api/logs', async (req, res) => {
    try {
      const logData = insertTaskLogSchema.parse(req.body);
      const log = await storage.createTaskLog(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid log data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create task log' });
      }
    }
  });

  // GET /api/logs → list all task logs
  app.get('/api/logs', async (req, res) => {
    try {
      const { user } = req.query;
      
      if (user && typeof user === 'string') {
        const logs = await storage.getTaskLogsByUser(user);
        res.json(logs);
      } else {
        const logs = await storage.getTaskLogs();
        res.json(logs);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task logs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
