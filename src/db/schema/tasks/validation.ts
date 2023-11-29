import { Type } from "@sinclair/typebox";
import { task } from "./task";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const selectTasksSchema = createSelectSchema(task);
export const insertTasksSchema = createInsertSchema(task);

export const insertTasksSchemaOptionalData = createInsertSchema(task, {
  variables: Type.Optional(Type.Unknown()),
});

export const updateTasksSchema = Type.Omit(insertTasksSchemaOptionalData, [
  "id",
  "projectId",
  "createdAt",
]);
