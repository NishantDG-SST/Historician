import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Time periods
export const timePeriods = pgTable("time_periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  musicUrl: text("music_url"),
});

export const insertTimePeriodSchema = createInsertSchema(timePeriods).omit({
  id: true,
});

// Scenarios for each time period
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  timePeriodId: integer("time_period_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  historicalContext: text("historical_context"),
  year: integer("year"),
  location: text("location"),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
});

// Choices for each scenario
export const choices = pgTable("choices", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  text: text("text").notNull(),
  description: text("description"),
  outcome: text("outcome"),
  nextScenarioId: integer("next_scenario_id"),
  historicalImpact: text("historical_impact"),
});

export const insertChoiceSchema = createInsertSchema(choices).omit({
  id: true,
});

// Player journey
export const playerJourneys = pgTable("player_journeys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scenarioId: integer("scenario_id").notNull(),
  choiceId: integer("choice_id").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertPlayerJourneySchema = createInsertSchema(playerJourneys).omit({
  id: true,
});

// API Request schema for DeepSeek
export const deepSeekRequestSchema = z.object({
  prompt: z.string(),
  type: z.enum(["image", "choices", "context"]),
  period: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTimePeriod = z.infer<typeof insertTimePeriodSchema>;
export type TimePeriod = typeof timePeriods.$inferSelect;

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

export type InsertChoice = z.infer<typeof insertChoiceSchema>;
export type Choice = typeof choices.$inferSelect;

export type InsertPlayerJourney = z.infer<typeof insertPlayerJourneySchema>;
export type PlayerJourney = typeof playerJourneys.$inferSelect;

export type DeepSeekRequest = z.infer<typeof deepSeekRequestSchema>;
