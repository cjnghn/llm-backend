import Queue from "bull";
import { env } from "@/env";
import { generateChatCompletion } from "@/modules/completion/service";
import { getProjectByID } from "@/modules/project/service";
import { getTaskByID, updateTask } from "@/modules/task/service";

export const queue = new Queue("task_queue", {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

queue.process(async (job) => {
  const { projectId, taskId } = job.data;
  // console.log("job.data", job.data);

  const project = await getProjectByID(projectId);
  const task = await getTaskByID(taskId);

  // FIXME: 더 좋은 방식이 있는지 고민하기.
  // project.prompt 내에 있는 대괄호로 감싸진 변수 [key] 을
  // task.data 에 있는 값 task.data[key] 로 치환한다.
  const prompt = project.prompt!.replace(/\[(.+?)\]/g, (_, key) => {
    return (task.variables as Record<string, string>)[key];
  });

  const result = await generateChatCompletion(prompt);

  return { taskId: task.id, result };
});

queue.on("completed", async (job) => {
  const { taskId, result } = job.returnvalue;
  await updateTask(taskId, { status: "COMPLETED", result });
});

queue.on("failed", async (job, err) => {
  const { taskId } = job.data;
  console.error(err);

  await updateTask(taskId, { status: "FAILED", result: "" });
});
