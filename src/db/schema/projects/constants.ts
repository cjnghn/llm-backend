import { pgEnum } from "drizzle-orm/pg-core";

export const ProjectVisibilityEnum = pgEnum("project_visibility", [
  "PUBLIC",
  "PRIVATE",
]);
