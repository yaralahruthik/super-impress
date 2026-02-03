import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { account, post, postPublication } from "../../db/schema";
import {
  createLinkedInPost,
  getLinkedInProfile,
  getPersonUrnFromSub,
} from "./client";

/**
 * Get user's LinkedIn account details
 * @param userId - User ID
 * @returns LinkedIn account or null if not connected
 */
export async function getLinkedInAccount(userId: string) {
  const [linkedInAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "linkedin")))
    .limit(1);

  return linkedInAccount ?? null;
}

/**
 * Check if user has LinkedIn account connected
 * @param userId - User ID
 * @returns Connection status with account details
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  accountId?: string;
}> {
  const linkedInAccount = await getLinkedInAccount(userId);

  if (!linkedInAccount) {
    return { connected: false };
  }

  return {
    connected: true,
    accountId: linkedInAccount.accountId,
  };
}

/**
 * Publish a post to LinkedIn
 * @param userId - User ID
 * @param postId - Post ID to publish
 * @returns LinkedIn post ID
 */
export async function publishPost(
  userId: string,
  postId: string,
): Promise<{ linkedInPostId: string }> {
  // 1. Verify user owns the post
  const [postRecord] = await db
    .select()
    .from(post)
    .where(and(eq(post.id, postId), eq(post.userId, userId)))
    .limit(1);

  if (!postRecord) {
    throw new Error("Post not found or unauthorized");
  }

  // 2. Get LinkedIn account
  const linkedInAccount = await getLinkedInAccount(userId);
  if (!linkedInAccount) {
    throw new Error("LinkedIn account not connected");
  }

  if (!linkedInAccount.accessToken) {
    throw new Error("LinkedIn access token not available");
  }

  // 3. Check if already published to LinkedIn
  const [existingPublication] = await db
    .select()
    .from(postPublication)
    .where(
      and(
        eq(postPublication.postId, postId),
        eq(postPublication.platform, "linkedin"),
        eq(postPublication.accountId, linkedInAccount.id),
      ),
    )
    .limit(1);

  if (existingPublication) {
    throw new Error("Post already published to LinkedIn");
  }

  // 4. Get LinkedIn profile to get person URN
  const profile = await getLinkedInProfile(linkedInAccount.accessToken);
  const personUrn = getPersonUrnFromSub(profile.sub);

  // 5. Create post on LinkedIn
  const linkedInPostId = await createLinkedInPost(
    linkedInAccount.accessToken,
    personUrn,
    postRecord.content,
  );

  // 6. Save publication record
  await db.insert(postPublication).values({
    postId: postRecord.id,
    platform: "linkedin",
    platformPostId: linkedInPostId,
    accountId: linkedInAccount.accountId,
    metadata: {
      personUrn,
      contentLength: postRecord.content.length,
    },
  });

  return { linkedInPostId };
}

/**
 * Get all publications for a post
 * @param postId - Post ID
 * @returns List of publications
 */
export async function getPublications(postId: string) {
  return await db
    .select()
    .from(postPublication)
    .where(eq(postPublication.postId, postId));
}
