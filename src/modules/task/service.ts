import { db } from "@/db";
import { Static } from "@sinclair/typebox";
import { insertTasksSchema, task, updateTasksSchema } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NotFoundError } from "elysia";
import { PaginationParams } from "../shared";

const paginationTasks = async (
  projectId: number,
  { offset, limit }: PaginationParams
) => {
  const totalTasks = (
    await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(task)
      .where(eq(task.projectId, projectId))
  )[0].count;
  const tasks = await db
    .select()
    .from(task)
    .where(eq(task.projectId, projectId))
    .offset(offset)
    .limit(limit);

  return {
    data: tasks,
    total: totalTasks,
    hasMore: offset + limit < totalTasks,
  };
};

const getAllTasks = async (projectId: number) => {
  return await db.select().from(task).where(eq(task.projectId, projectId));
};

const getPendingTasks = async (projectId: number) => {
  return await db
    .select()
    .from(task)
    .where(and(eq(task.projectId, projectId), eq(task.status, "PENDING")));
};

const getTaskByID = async (taskId: number) => {
  const result = await db
    .select()
    .from(task)
    .where(and(eq(task.id, taskId)));

  if (!result[0]) throw new NotFoundError("task not found");

  return result[0];
};

const createTask = async (data: Static<typeof insertTasksSchema>) => {
  const result = await db.insert(task).values(data).returning();

  return result[0];
};

const updateTask = async (
  taskId: number,
  data: Static<typeof updateTasksSchema>
) => {
  const result = await db
    .update(task)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(task.id, taskId))
    .returning();

  if (!result[0]) throw new NotFoundError("task not found");

  return result[0];
};

const deleteTask = async ({
  projectId,
  taskId,
}: {
  projectId: number;
  taskId: number;
}) => {
  const result = await db
    .delete(task)
    .where(and(eq(task.id, taskId), eq(task.projectId, projectId)))
    .returning();

  if (!result[0]) throw new NotFoundError("Task not found");

  return result[0];
};

export {
  paginationTasks,
  getAllTasks,
  getPendingTasks,
  getTaskByID,
  createTask,
  updateTask,
  deleteTask,
};
