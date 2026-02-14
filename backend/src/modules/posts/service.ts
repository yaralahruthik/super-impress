import { and, arrayContains, count, desc, eq, sql } from "drizzle-orm";
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
const publicationColumns = {
  id: true,
  platform: true,
  platformPostId: true,
  url: true,
  accountId: true,
  publishedAt: true,
} as const;

function countWords(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WORD_REGEX).length;
}

export async function createPost(
  userId: string,
  data: typeof PostCreate.static
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
      publications: {
        columns: publicationColumns,
      },
    },
  });

  return result ?? null;
}

export async function listUserPosts(options: {
  userId: string;
  status?: typeof PostStatus.static;
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
        publications: {
          columns: publicationColumns,
        },
      },
    }),
    db.select({ total: count() }).from(post).where(whereClause),
  ]);

  return { posts, total };
}

export async function updatePost(
  postId: number,
  userId: string,
  data: typeof PostUpdate.static
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
  const [deletedPost] = await db
    .delete(post)
    .where(and(eq(post.id, postId), eq(post.userId, userId)))
    .returning({ id: post.id });

  return Boolean(deletedPost);
}

export async function markAsPublished(
  userId: string,
  postId: number,
  data: typeof ManualPublicationRequest.static
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
  const posts = await db.query.post.findMany({
    where: eq(post.userId, userId),
    columns: {
      content: true,
    },
    with: {
      publications: {
        columns: {
          id: true,
        },
      },
    },
  });

  const statusCounts = {
    draft: 0,
    published: 0,
  };

  let totalWordCount = 0;

  for (const record of posts) {
    if (record.publications.length > 0) {
      statusCounts.published += 1;
    } else {
      statusCounts.draft += 1;
    }
    totalWordCount += countWords(record.content);
  }

  return {
    totalPosts: posts.length,
    totalWordCount,
    statusCounts,
  };
}
