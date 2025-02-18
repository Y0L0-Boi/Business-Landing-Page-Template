import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// New tables for the mutual fund distribution system
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  panNumber: text("pan_number").notNull(),
  kycStatus: boolean("kyc_status").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  fundName: text("fund_name").notNull(),
  units: decimal("units").notNull(),
  currentNav: decimal("current_nav").notNull(),
  investedAmount: decimal("invested_amount").notNull(),
  currentValue: decimal("current_value").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id").references(() => funds.id),
  type: text("type").notNull(), // "BUY" or "SELL" or "SIP"
  units: decimal("units").notNull(),
  navValue: decimal("nav_value").notNull(),
  amount: decimal("amount").notNull(),
  date: timestamp("date").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fundId: integer("fund_id").references(() => funds.id),
  amount: decimal("amount").notNull(),
  rate: decimal("rate").notNull(),
  date: timestamp("date").defaultNow(),
});

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertFundSchema = createInsertSchema(funds).omit({
  id: true,
  lastUpdated: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  date: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Fund = typeof funds.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Commission = typeof commissions.$inferSelect;