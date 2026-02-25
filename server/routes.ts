import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Families
  app.get(api.families.list.path, async (req, res) => {
    const families = await storage.getFamilies();
    res.json(families);
  });

  app.post(api.families.create.path, async (req, res) => {
    try {
      const input = api.families.create.input.parse(req.body);
      const family = await storage.createFamily(input);
      res.status(201).json(family);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.families.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.families.update.input.parse(req.body);
      const family = await storage.updateFamily(id, input);
      res.json(family);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.families.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteFamily(id);
    res.status(204).send();
  });

  // Trackers
  app.get(api.trackers.list.path, async (req, res) => {
    const trackers = await storage.getTrackers();
    res.json(trackers);
  });

  app.post(api.trackers.create.path, async (req, res) => {
    try {
      const input = api.trackers.create.input.parse(req.body);
      const tracker = await storage.createTracker(input);
      res.status(201).json(tracker);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.trackers.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.trackers.update.input.parse(req.body);
      const tracker = await storage.updateTracker(id, input);
      res.json(tracker);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.trackers.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTracker(id);
    res.status(204).send();
  });

  // Tracker Entries
  app.get(api.trackerEntries.list.path, async (req, res) => {
    const date = req.query.date as string | undefined;
    const month = req.query.month as string | undefined;
    const entries = await storage.getTrackerEntries(date, month);
    res.json(entries);
  });

  app.post(api.trackerEntries.create.path, async (req, res) => {
    try {
      const input = api.trackerEntries.create.input.parse(req.body);
      const entry = await storage.createTrackerEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.trackerEntries.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.trackerEntries.update.input.parse(req.body);
      const entry = await storage.updateTrackerEntry(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.trackerEntries.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTrackerEntry(id);
    res.status(204).send();
  });

  // Seed data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingFamilies = await storage.getFamilies();
  if (existingFamilies.length === 0) {
    const family1 = await storage.createFamily({ name: "Sport", icon: "🏃‍♂️", order: 1 });
    const family2 = await storage.createFamily({ name: "Health", icon: "🍏", order: 2 });
    
    const tracker1 = await storage.createTracker({ 
      name: "Pilates", 
      familyId: family1.id, 
      color: "#f87171", // red-400
      description: "20 min daily pilates",
      order: 1 
    });
    
    const tracker2 = await storage.createTracker({ 
      name: "10k steps", 
      familyId: family1.id, 
      color: "#fb923c", // orange-400
      order: 2 
    });
    
    const tracker3 = await storage.createTracker({ 
      name: "Meditation", 
      familyId: family2.id, 
      color: "#60a5fa", // blue-400
      description: "10 min morning meditation",
      order: 1 
    });

    const tracker4 = await storage.createTracker({ 
      name: "Read 10 pages", 
      color: "#a78bfa", // purple-400
      description: "Read before bed",
      order: 4
    });

    // Seed some entries for today
    const today = new Date().toISOString().split('T')[0];
    await storage.createTrackerEntry({
      trackerId: tracker1.id,
      date: today,
      note: "Felt great today!",
    });
    
    await storage.createTrackerEntry({
      trackerId: tracker3.id,
      date: today,
    });
  }
}
