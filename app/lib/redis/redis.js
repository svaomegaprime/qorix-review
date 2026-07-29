import { Redis } from "ioredis";

export const connection = new Redis({
  host: "localhost",
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
