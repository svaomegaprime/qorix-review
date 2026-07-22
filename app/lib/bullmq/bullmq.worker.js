import { Worker } from "bullmq";
import { connection } from "../redis/redis";
import bullmqService from "./bullmq.service";

const reviewWorker = new Worker(
  "QUEUE_SCHEDULE_EMAIL",
  async (job) => {
    switch (job.name) {
      case "JOB_SCHEDULE_EMAIL":
        console.log("worker is working", job.data);
        await bullmqService.scheduleEmailSend(job.data);
        break;
      case "JOB_REMINDER_EMAIL":
        console.log("worker is working", job.data);
        await bullmqService.reminderEmailSend(job.data);
        break;
      case "JOB_CLIENT_CONFIRMATION_EMAIL":
        console.log("worker is working", job.data);
        await bullmqService.clientConfirmationEmailSend(job.data);

        break;
      case "JOB_ADMIN_NOTIFICATION_EMAIL":
        console.log("worker is working", job.data);
        await bullmqService.adminConfirmationEmailSend(job.data);

        break;

      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5, // Optional: Process up to 5 emails simultaneously
  },
);

// Listen for success
reviewWorker.on("completed", (job) => {
  console.log(`Review worker job ${job.id} completed successfully.`);
});

// Listen for failure
reviewWorker.on("failed", (job, err) => {
  console.error(`Review worker job ${job?.id} failed. Error:`, err);
});

// Graceful shutdown for production reliability
process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing worker");
  await reviewWorker.close();
});

process.on("SIGINT", async () => {
  console.info("SIGINT signal received: closing worker");
  await reviewWorker.close();
});
