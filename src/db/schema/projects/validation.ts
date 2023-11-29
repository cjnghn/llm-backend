import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Type } from "@sinclair/typebox";
import { project } from "./project";

export const selectProjectSchema = createSelectSchema(project);
export const insertProjectSchema = createInsertSchema(project);

export const insertProjectSchemaOptionalName = createInsertSchema(project, {
  name: Type.Optional(Type.String()),
});

export const updateProjectSchema = Type.Omit(insertProjectSchemaOptionalName, [
  "id",
  "createdAt",
]);
