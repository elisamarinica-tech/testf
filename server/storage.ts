import { db } from "./db";
import {
  families,
  trackers,
  trackerEntries,
  type InsertFamily,
  type UpdateFamilyRequest,
  type InsertTracker,
  type UpdateTrackerRequest,
  type InsertTrackerEntry,
  type UpdateTrackerEntryRequest,
  type Family,
  type Tracker,
  type TrackerEntry
} from "@shared/schema";
import { eq, and, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Families
  getFamilies(): Promise<Family[]>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, updates: UpdateFamilyRequest): Promise<Family>;
  deleteFamily(id: number): Promise<void>;

  // Trackers
  getTrackers(): Promise<Tracker[]>;
  createTracker(tracker: InsertTracker): Promise<Tracker>;
  updateTracker(id: number, updates: UpdateTrackerRequest): Promise<Tracker>;
  deleteTracker(id: number): Promise<void>;

  // Tracker Entries
  getTrackerEntries(date?: string, month?: string): Promise<TrackerEntry[]>;
  createTrackerEntry(entry: InsertTrackerEntry): Promise<TrackerEntry>;
  updateTrackerEntry(id: number, updates: UpdateTrackerEntryRequest): Promise<TrackerEntry>;
  deleteTrackerEntry(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Families
  async getFamilies(): Promise<Family[]> {
    return await db.select().from(families).orderBy(families.order);
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const [created] = await db.insert(families).values(family).returning();
    return created;
  }

  async updateFamily(id: number, updates: UpdateFamilyRequest): Promise<Family> {
    const [updated] = await db.update(families)
      .set(updates)
      .where(eq(families.id, id))
      .returning();
    return updated;
  }

  async deleteFamily(id: number): Promise<void> {
    await db.delete(families).where(eq(families.id, id));
  }

  // Trackers
  async getTrackers(): Promise<Tracker[]> {
    return await db.select().from(trackers).orderBy(trackers.order);
  }

  async createTracker(tracker: InsertTracker): Promise<Tracker> {
    const [created] = await db.insert(trackers).values(tracker).returning();
    return created;
  }

  async updateTracker(id: number, updates: UpdateTrackerRequest): Promise<Tracker> {
    const [updated] = await db.update(trackers)
      .set(updates)
      .where(eq(trackers.id, id))
      .returning();
    return updated;
  }

  async deleteTracker(id: number): Promise<void> {
    await db.update(trackers)
      .set({ isArchived: true })
      .where(eq(trackers.id, id));
  }

  // Tracker Entries
  async getTrackerEntries(date?: string, month?: string): Promise<TrackerEntry[]> {
    let query = db.select().from(trackerEntries);
    
    if (date) {
      query = query.where(eq(trackerEntries.date, date)) as any;
    } else if (month) {
      // Month is expected as YYYY-MM
      query = query.where(like(trackerEntries.date, `${month}-%`)) as any;
    }
    
    return await query;
  }

  async createTrackerEntry(entry: InsertTrackerEntry): Promise<TrackerEntry> {
    const [created] = await db.insert(trackerEntries).values(entry).returning();
    return created;
  }

  async updateTrackerEntry(id: number, updates: UpdateTrackerEntryRequest): Promise<TrackerEntry> {
    const [updated] = await db.update(trackerEntries)
      .set(updates)
      .where(eq(trackerEntries.id, id))
      .returning();
    return updated;
  }

  async deleteTrackerEntry(id: number): Promise<void> {
    await db.delete(trackerEntries).where(eq(trackerEntries.id, id));
  }
}

export const storage = new DatabaseStorage();
