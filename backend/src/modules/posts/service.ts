import { and, arrayContains, count, desc, eq, sql, sum } from "drizzle-orm";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { db } from "../../db";
import { post, postPublication } from "../../db/schema";
import type {
  ManualPublicationRequest,
  PostCreate,
  PostStatus,
  PostUpdate,
} from "./model";

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
    })
    .returning();

  return newPost;
}

export async function getPostById(postId: number, userId: string) {
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
    if (status === "published") {
      conditions.push(
        sql`exists (select 1 from ${postPublication} where ${postPublication.postId} = ${post.id})`
      );
    } else {
      conditions.push(
        sql`not exists (select 1 from ${postPublication} where ${postPublication.postId} = ${post.id})`
      );
    }
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
  postId: number,
  userId: string,
  data: PostUpdate
): Promise<Awaited<ReturnType<typeof getPostById>>> {
  const existing = await getPostById(postId, userId);
  if (!existing) {
    return null;
  }

  await db
    .update(post)
    .set(data)
    .where(and(eq(post.id, postId), eq(post.userId, userId)));

  return getPostById(postId, userId);
}

export async function deletePost(
  postId: number,
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
  postId: number,
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

  return publication;
}

export async function deletePublication(
  userId: string,
  postId: number,
  publicationId: number
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
  statusCounts: { draft: number; published: number };
}> {
  const [result] = await db
    .select({
      totalPosts: count(),
      totalWordCount:
        sql<number>`coalesce(${sum(post.wordCount)}, 0)`.mapWith(Number),
      publishedCount: sql<number>`count(*) filter (where exists (
        select 1 from ${postPublication} where ${postPublication.postId} = ${post.id}
      ))`.mapWith(Number),
    })
    .from(post)
    .where(eq(post.userId, userId));

  return {
    totalPosts: result.totalPosts,
    totalWordCount: result.totalWordCount,
    statusCounts: {
      published: result.publishedCount,
      draft: result.totalPosts - result.publishedCount,
    },
  };
}
