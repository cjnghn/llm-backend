import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { user } from "./user";

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);
