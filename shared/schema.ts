import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
});

export const trackers = pgTable("trackers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  familyId: integer("family_id").references(() => families.id),
  color: text("color").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
});

// A record here means the tracker was checked for this date
export const trackerEntries = pgTable("tracker_entries", {
  id: serial("id").primaryKey(),
  trackerId: integer("tracker_id").notNull().references(() => trackers.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  note: text("note"),
  photoUrl: text("photo_url"),
});

export const insertFamilySchema = createInsertSchema(families).omit({ id: true });
export const insertTrackerSchema = createInsertSchema(trackers).omit({ id: true });
export const insertTrackerEntrySchema = createInsertSchema(trackerEntries).omit({ id: true });

export type Family = typeof families.$inferSelect;
export type InsertFamily = z.infer<typeof insertFamilySchema>;

export type Tracker = typeof trackers.$inferSelect;
export type InsertTracker = z.infer<typeof insertTrackerSchema>;

export type TrackerEntry = typeof trackerEntries.$inferSelect;
export type InsertTrackerEntry = z.infer<typeof insertTrackerEntrySchema>;

// API request types
export type UpdateFamilyRequest = Partial<InsertFamily>;
export type UpdateTrackerRequest = Partial<InsertTracker>;
export type UpdateTrackerEntryRequest = Partial<InsertTrackerEntry>;
