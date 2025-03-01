import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: numeric("balance").notNull().default("1000"),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount").notNull(),
  price: numeric("price").notNull(),
  type: text("type").notNull(), // buy or sell
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  credits: numeric("credits").notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCreditSchema = createInsertSchema(credits);
export const insertProjectSchema = createInsertSchema(projects);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Credit = typeof credits.$inferSelect;
export type Project = typeof projects.$inferSelect;
