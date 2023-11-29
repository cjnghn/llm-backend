import { relations } from "drizzle-orm";
import { serial, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { ProjectVisibilityEnum } from "./constants";
import { task } from "..";

export const project = pgTable("project", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 256 }).notNull(),
  description: varchar("description", { length: 256 }).default(""),
  prompt: text("prompt").default(""),
  visibility: ProjectVisibilityEnum("visibility").default("PRIVATE"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectRelations = relations(project, ({ many }) => ({
  tasks: many(task),
}));
