import { Queue } from "bullmq";
import { connection } from "../redis/redis";

export function createQueue(name) {
  return new Queue(name, {
    connection,
  });
}

export async function addJobInQueue(queue, jobName, data, delay, jobId) {
  const options = {
    delay: delay,
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: false,
  };
  if (jobId) {
    options.jobId = jobId.replace(/:/g, "_");
  }
  return await queue.add(jobName, data, options);
}

export async function removeJobInQueue(queue, jobId) {
  await queue.remove(jobId);
}

export const reviewQueue = createQueue("QUEUE_SCHEDULE_EMAIL");
