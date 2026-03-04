import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { LINKEDIN_CONFIG } from "../constants";
import { db } from "../db";
import { account, post, postPublication } from "../db/schema";
import { env } from "../env";
import {
  createLinkedInPost,
  getPersonUrnFromAccountId,
} from "../modules/linkedin/client";
import {
  markScheduleFailed,
  markSchedulePublished,
} from "../modules/posts/service";

const connection = { url: env.REDIS_URL };

interface PublishJobData {
  scheduleId: number;
  postId: number;
  userId: string;
  platform: string;
  accountId: string;
}

async function getStoredAccessToken(accountId: string): Promise<{
  accessToken: string;
  providerAccountId: string;
}> {
  const accountRecord = await db.query.account.findFirst({
    where: eq(account.id, accountId),
  });

  if (!accountRecord?.accessToken) {
    throw new Error("No stored access token for account");
  }

  if (
    accountRecord.accessTokenExpiresAt &&
    accountRecord.accessTokenExpiresAt < new Date()
  ) {
    throw new Error(
      "LinkedIn access token has expired. Please re-authenticate and reschedule."
    );
  }

  return {
    accessToken: accountRecord.accessToken,
    providerAccountId: accountRecord.accountId,
  };
}

async function processScheduledPublish(data: PublishJobData): Promise<void> {
  const { scheduleId, postId, platform, accountId } = data;

  if (platform !== LINKEDIN_CONFIG.providerId) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const tokens = await getStoredAccessToken(accountId);
  const personUrn = getPersonUrnFromAccountId(tokens.providerAccountId);

  const postRecord = await db.query.post.findFirst({
    where: eq(post.id, postId),
  });

  if (!postRecord) {
    throw new Error(`Post ${postId} not found`);
  }

  const linkedInPostId = await createLinkedInPost(
    tokens.accessToken,
    personUrn,
    postRecord.content
  );

  const [publication] = await db
    .insert(postPublication)
    .values({
      postId,
      platform: LINKEDIN_CONFIG.providerId,
      platformPostId: linkedInPostId,
      accountId,
      metadata: {
        scheduled: true,
        scheduleId,
        personUrn,
        contentLength: postRecord.content.length,
      },
    })
    .returning();

  await markSchedulePublished(scheduleId, publication.id);
  console.log(
    `[Worker] Successfully published post ${postId} to LinkedIn (schedule ${scheduleId})`
  );
}

export const publishWorker = new Worker<PublishJobData>(
  "scheduled-publish",
  async (job) => {
    console.log(
      `[Worker] Processing schedule ${job.data.scheduleId} for post ${job.data.postId}, attempt ${job.attemptsMade + 1}`
    );
    await processScheduledPublish(job.data);
  },
  {
    connection,
    concurrency: 5,
  }
);

publishWorker.on("failed", async (job, error) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    console.error(
      `[Worker] Schedule ${job.data.scheduleId} failed permanently:`,
      error.message
    );
    await markScheduleFailed(
      job.data.scheduleId,
      error.message,
      job.attemptsMade
    );
  }
});

publishWorker.on("error", (error) => {
  console.error("[Worker] Error:", error);
});
