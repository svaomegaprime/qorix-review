import { Queue } from "bullmq";
import { connection } from "../redis/redis";

export function createQueue(name) {
    return new Queue(name, {
        connection,
    })
}


export async function addQueue(queue, jobName, data, delay) {
    await queue.add(
        jobName,
        data,
        {
            delay: delay,
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: false,
        }
    );
}

export const reviewQueue = createQueue("review-email");

