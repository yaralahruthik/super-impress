import { and, eq } from "drizzle-orm";
import { auth } from "../../auth";
import { db } from "../../db";
import { post, postPublication } from "../../db/schema";
import { createLinkedInPost, getPersonUrnFromAccountId } from "./client";

type LinkedInAccount = {
  id: string;
  accountId: string;
  providerId: string;
};

async function getLinkedInAccountFromAuth(
  headers: Headers,
): Promise<LinkedInAccount | null> {
  const accounts = await auth.api.listUserAccounts({ headers });
  if (!Array.isArray(accounts)) {
    return null;
  }

  const linkedInAccount = accounts.find(
    (account) => account.providerId === "linkedin",
  );

  return linkedInAccount ?? null;
}

export async function getConnectionStatus(headers: Headers): Promise<{
  connected: boolean;
  accountId?: string;
}> {
  const linkedInAccount = await getLinkedInAccountFromAuth(headers);

  if (!linkedInAccount) {
    return { connected: false };
  }

  return {
    connected: true,
    accountId: linkedInAccount.accountId,
  };
}

export async function publishPost(
  userId: string,
  postId: string,
  headers: Headers,
): Promise<{ linkedInPostId: string }> {
  const [postRecord] = await db
    .select()
    .from(post)
    .where(and(eq(post.id, postId), eq(post.userId, userId)))
    .limit(1);

  if (!postRecord) {
    throw new Error("Post not found or unauthorized");
  }

  const linkedInAccount = await getLinkedInAccountFromAuth(headers);
  if (!linkedInAccount) {
    throw new Error("LinkedIn account not connected");
  }

  const tokens = await auth.api.getAccessToken({
    headers,
    body: {
      providerId: "linkedin",
      accountId: linkedInAccount.id,
    },
  });
  if (!tokens.accessToken) {
    throw new Error("LinkedIn access token not available");
  }

  const personUrn = getPersonUrnFromAccountId(linkedInAccount.accountId);

  const linkedInPostId = await createLinkedInPost(
    tokens.accessToken,
    personUrn,
    postRecord.content,
  );

  await db.insert(postPublication).values({
    postId: postRecord.id,
    platform: "linkedin",
    platformPostId: linkedInPostId,
    accountId: linkedInAccount.id,
    metadata: {
      personUrn,
      contentLength: postRecord.content.length,
    },
  });

  return { linkedInPostId };
}

export async function getPublications(postId: string) {
  return await db
    .select()
    .from(postPublication)
    .where(eq(postPublication.postId, postId));
}
