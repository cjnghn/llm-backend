import { db } from "@/db";
import {
  project,
  insertProjectSchema,
  updateProjectSchema,
  selectProjectSchema,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NotFoundError } from "elysia";
import { Static } from "@sinclair/typebox";
import { PaginationParams, PaginationResult } from "@/modules/shared";

const paginationProjects = async ({ offset, limit }: PaginationParams) => {
  const totalProjects = (
    await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(project)
  )[0].count;
  const projects = await db.select().from(project).offset(offset).limit(limit);

  return {
    data: projects,
    total: totalProjects,
    hasMore: offset + limit < totalProjects,
  };
};

const getProjectByID = async (projectId: number) => {
  const result = await db
    .select()
    .from(project)
    .where(eq(project.id, projectId));

  if (!result[0]) throw new NotFoundError("Project with this id not found");

  return result[0];
};

const createProject = async (data: Static<typeof insertProjectSchema>) => {
  const result = await db.insert(project).values(data).returning();

  return result[0];
};

const updateProject = async (
  projectId: number,
  body: Static<typeof updateProjectSchema>
) => {
  const result = await db
    .update(project)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(project.id, projectId))
    .returning();

  if (!result[0]) throw new NotFoundError("Project with this id not found");

  return result[0];
};

const deleteProject = async (projectId: number) => {
  // check if project exists
  await getProjectByID(projectId);
  await db.delete(project).where(eq(project.id, projectId));

  return "ok";
};

export {
  paginationProjects,
  getProjectByID,
  createProject,
  updateProject,
  deleteProject,
};
