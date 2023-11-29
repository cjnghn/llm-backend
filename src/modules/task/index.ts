import { Elysia, NotFoundError, t } from "elysia";
import { queue } from "@/libs/task";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getPendingTasks,
  getTaskByID,
  paginationTasks,
  updateTask,
} from "./service";
import { getProjectByID } from "../project/service";
import { insertTasksSchema } from "@/db";

const task = (app: Elysia) =>
  app.group("/projects/:projectId/tasks", (app) =>
    app
      // pagination
      .get(
        "/",
        async ({
          params: { projectId },
          query: { offset = 0, limit = 10 },
        }) => {
          return paginationTasks(projectId, { offset, limit });
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
          }),
          query: t.Object({
            offset: t.Optional(t.Numeric({ default: 0 })),
            limit: t.Optional(t.Numeric({ default: 10 })),
          }),
          detail: {
            summary: "get all tasks",
            tags: ["run"],
          },
        }
      )
      .get(
        "/:taskId",
        async ({ params: { taskId } }) => {
          return getTaskByID(taskId);
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
            taskId: t.Numeric(),
          }),
          detail: {
            summary: 'get a run by "taskId"',
            tags: ["run"],
          },
        }
      )
      .post(
        "/",
        async ({ params: { projectId }, body }) => {
          return createTask({ ...body, projectId, status: "PENDING" });
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
          }),
          body: t.Object({
            variables: t.Record(t.String(), t.String()),
          }),
          detail: {
            summary: "create a run",
            tags: ["run"],
          },
        }
      )
      .put(
        "/:taskId",
        async ({ params: { taskId }, body }) => {
          return updateTask(taskId, body);
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
            taskId: t.Numeric(),
          }),
          body: insertTasksSchema,
          detail: {
            summary: 'update a run by "taskId"',
            tags: ["run"],
          },
        }
      )
      .delete(
        "/:taskId",
        async ({ params: { projectId, taskId } }) => {
          await deleteTask({ projectId, taskId });

          return "ok";
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
            taskId: t.Numeric(),
          }),
          detail: {
            summary: 'delete a run by "taskId"',
            tags: ["run"],
          },
        }
      )
      .post(
        "/:taskId/start",
        async ({ params: { projectId, taskId } }) => {
          const project = await getProjectByID(projectId);
          const task = await getTaskByID(taskId);

          if (!project.prompt) throw new NotFoundError("prompt not found");

          await updateTask(task.id, { status: "RUNNING", result: "" });
          await queue.add({ projectId: project.id, taskId: task.id });

          return task.id;
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
            taskId: t.Numeric(),
          }),
          detail: {
            summary: 'Start a selected "PENDING" run',
            tags: ["run"],
          },
        }
      )
      .post(
        "/start-all",
        async ({ params: { projectId }, query: { force } }) => {
          const tasks =
            force === "true"
              ? await getAllTasks(projectId)
              : await getPendingTasks(projectId);

          const project = await getProjectByID(projectId);

          if (!project.prompt) throw new NotFoundError("set prompt first");

          await Promise.all(
            tasks.map((task) => updateTask(task.id, { status: "RUNNING" }))
          );

          await queue.addBulk(
            tasks.map((task) => ({
              data: {
                projectId: project.id,
                taskId: task.id,
              },
            }))
          );

          return tasks.map((task) => task.id);
        },
        {
          params: t.Object({
            projectId: t.Numeric(),
          }),
          query: t.Object({
            force: t.Optional(t.Literal("true")),
          }),
          detail: {
            summary: 'Start all "PENDING" tasks',
            tags: ["run"],
          },
        }
      )
      .get(
        "/task-counts",
        async () => {
          return queue.getJobCounts();
        },
        {
          detail: {
            summary: "Get queue counts",
            tags: ["run"],
          },
        }
      )
  );

export { task };
