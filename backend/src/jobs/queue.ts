import { Queue } from "bullmq";
import { env } from "../env";

const connection = { url: env.REDIS_URL };

export const publishQueue = new Queue("scheduled-publish", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 30_000,
    },
    removeOnComplete: { age: 86_400 },
    removeOnFail: { age: 604_800 },
  },
});
