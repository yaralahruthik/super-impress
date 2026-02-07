import { and, arrayContains, count, desc, eq } from "drizzle-orm";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { db } from "../../db";
import { post, postPublication } from "../../db/schema";
import type {
  ManualPublicationRequest,
  PostCreate,
  PostStatus,
  PostUpdate,
} from "./model";

const WORD_REGEX = /\s+/;

function countWords(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WORD_REGEX).length;
}

export async function createPost(
  userId: string,
  data: PostCreate
): Promise<typeof post.$inferSelect> {
  const [newPost] = await db
    .insert(post)
    .values({
      userId,
      title: data.title ?? null,
      content: data.content,
      tags: data.tags ?? [],
      status: data.status ?? "draft",
    })
    .returning();

  return newPost;
}

export async function getPostById(postId: string, userId: string) {
  const result = await db.query.post.findFirst({
    where: and(eq(post.id, postId), eq(post.userId, userId)),
    with: {
      publications: true,
    },
  });

  return result ?? null;
}

export async function listUserPosts(options: {
  userId: string;
  status?: PostStatus;
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  const {
    userId,
    status,
    tag,
    limit = DEFAULT_POSTS_LIMIT,
    offset = 0,
  } = options;

  const conditions = [eq(post.userId, userId)];

  if (status) {
    conditions.push(eq(post.status, status));
  }

  if (tag) {
    conditions.push(arrayContains(post.tags, [tag]));
  }

  const whereClause = and(...conditions);

  const [posts, [{ total }]] = await Promise.all([
    db.query.post.findMany({
      where: whereClause,
      orderBy: [desc(post.createdAt)],
      limit,
      offset,
      with: {
        publications: true,
      },
    }),
    db.select({ total: count() }).from(post).where(whereClause),
  ]);

  return { posts, total };
}

export async function updatePost(
  postId: string,
  userId: string,
  data: PostUpdate
): Promise<typeof post.$inferSelect | null> {
  const existing = await getPostById(postId, userId);
  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(post)
    .set(data)
    .where(and(eq(post.id, postId), eq(post.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deletePost(
  postId: string,
  userId: string
): Promise<boolean> {
  const existing = await getPostById(postId, userId);
  if (!existing) {
    return false;
  }

  await db
    .delete(post)
    .where(and(eq(post.id, postId), eq(post.userId, userId)));

  return true;
}

export async function markAsPublished(
  userId: string,
  postId: string,
  data: ManualPublicationRequest
) {
  const existing = await getPostById(postId, userId);
  if (!existing) {
    return null;
  }

  const [publication] = await db
    .insert(postPublication)
    .values({
      postId,
      platform: data.platform,
      platformPostId: null,
      url: data.url,
      accountId: null,
      metadata: { manual: true },
    })
    .returning();

  if (existing.status === "draft") {
    await db
      .update(post)
      .set({ status: "published" })
      .where(and(eq(post.id, postId), eq(post.userId, userId)));
  }

  return publication;
}

export async function deletePublication(
  userId: string,
  postId: string,
  publicationId: string
): Promise<boolean> {
  const publication = await db.query.postPublication.findFirst({
    where: and(
      eq(postPublication.id, publicationId),
      eq(postPublication.postId, postId)
    ),
    with: {
      post: true,
    },
  });

  if (!publication || publication.post.userId !== userId) {
    return false;
  }

  await db
    .delete(postPublication)
    .where(
      and(
        eq(postPublication.id, publicationId),
        eq(postPublication.postId, postId)
      )
    );

  return true;
}

export async function getPostsSummary(userId: string): Promise<{
  totalPosts: number;
  totalWordCount: number;
  statusCounts: { draft: number; published: number; archived: number };
}> {
  const posts = await db.query.post.findMany({
    where: eq(post.userId, userId),
    columns: {
      content: true,
      status: true,
    },
  });

  const statusCounts = {
    draft: 0,
    published: 0,
    archived: 0,
  };

  let totalWordCount = 0;

  for (const record of posts) {
    statusCounts[record.status] += 1;
    totalWordCount += countWords(record.content);
  }

  return {
    totalPosts: posts.length,
    totalWordCount,
    statusCounts,
  };
}
