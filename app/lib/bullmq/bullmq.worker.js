import { Worker } from "bullmq";
import { connection } from "../redis/redis";
import bullmqService from "./bullmq.service";

const REVIEW_TEST_QUEUE = "review-email";


const reviewWorker = new Worker(
  "QUEUE:SCHEDULE_EMAIL",
  async (job) => {

    switch (job.name) {
      case "JOB:SCHEDULE_EMAIL":
        
        await bullmqService.scheduleEmailSend(job.data);
        break;

      default:
        
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5, // Optional: Process up to 5 emails simultaneously
  }
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
process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received: closing worker');
  await reviewWorker.close();
});

process.on('SIGINT', async () => {
  console.info('SIGINT signal received: closing worker');
  await reviewWorker.close();
});