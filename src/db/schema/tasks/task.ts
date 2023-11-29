import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { project } from "..";
import { relations } from "drizzle-orm";
import { taskStatusEnum } from "./constants";

export const task = pgTable("task", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").references(() => project.id),

  status: taskStatusEnum("status").default("PENDING"),
  variables: jsonb("variables").notNull(),
  result: jsonb("result"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskRelations = relations(task, ({ one }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
}));
