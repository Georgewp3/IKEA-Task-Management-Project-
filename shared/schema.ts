import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  project: text("project").notNull(),
  tasks: text("tasks").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const taskLogs = pgTable("task_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user: text("user").notNull(),
  task: text("task").notNull(),
  status: text("status").notNull().default("COMPLETED"),
  comment: text("comment"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  project: true,
  tasks: true,
});

export const insertTaskLogSchema = createInsertSchema(taskLogs).pick({
  user: true,
  task: true,
  status: true,
  comment: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTaskLog = z.infer<typeof insertTaskLogSchema>;
export type TaskLog = typeof taskLogs.$inferSelect;
