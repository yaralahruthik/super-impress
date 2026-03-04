import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lte,
  sql,
} from "drizzle-orm";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { db } from "../../db";
import { post, postPublication, postSchedule } from "../../db/schema";
import type {
  CreateScheduleRequest,
  ManualPublicationRequest,
  PostCreate,
  PostStatus,
  PostUpdate,
  ScheduleStatus,
  UpdateScheduleRequest,
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

const MAX_SCHEDULE_DAYS = 31;

function countWords(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WORD_REGEX).length;
}

// ── Post CRUD ───────────────────────────────────────────────────────────

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

// ── Scheduling ──────────────────────────────────────────────────────────

function validateScheduleTime(scheduledAt: Date): void {
  if (scheduledAt <= new Date()) {
    throw new Error("Scheduled time must be in the future");
  }
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_SCHEDULE_DAYS);
  if (scheduledAt > maxDate) {
    throw new Error(
      `Cannot schedule more than ${MAX_SCHEDULE_DAYS} days in advance`
    );
  }
}

export async function createSchedule(
  userId: string,
  postId: number,
  data: typeof CreateScheduleRequest.static
): Promise<typeof postSchedule.$inferSelect> {
  const existing = await getPostById(postId, userId);
  if (!existing) {
    throw new Error("Post not found");
  }

  const scheduledAt = new Date(data.scheduledAt);
  validateScheduleTime(scheduledAt);

  const [schedule] = await db
    .insert(postSchedule)
    .values({
      postId,
      userId,
      platform: data.platform,
      accountId: data.accountId,
      scheduledAt,
      status: "pending",
    })
    .returning();

  return schedule;
}

export async function updateSchedule(
  userId: string,
  scheduleId: number,
  data: typeof UpdateScheduleRequest.static
): Promise<typeof postSchedule.$inferSelect | null> {
  const existing = await db.query.postSchedule.findFirst({
    where: and(
      eq(postSchedule.id, scheduleId),
      eq(postSchedule.userId, userId)
    ),
  });

  if (!existing) {
    return null;
  }

  if (existing.status !== "pending") {
    throw new Error("Can only reschedule pending schedules");
  }

  const scheduledAt = new Date(data.scheduledAt);
  validateScheduleTime(scheduledAt);

  const [updated] = await db
    .update(postSchedule)
    .set({ scheduledAt })
    .where(
      and(eq(postSchedule.id, scheduleId), eq(postSchedule.userId, userId))
    )
    .returning();

  return updated;
}

export async function cancelSchedule(
  userId: string,
  scheduleId: number
): Promise<boolean> {
  const existing = await db.query.postSchedule.findFirst({
    where: and(
      eq(postSchedule.id, scheduleId),
      eq(postSchedule.userId, userId)
    ),
  });

  if (!existing) {
    return false;
  }

  if (existing.status === "processing") {
    throw new Error(
      "Cannot cancel a schedule that is currently being published"
    );
  }

  if (existing.status !== "pending") {
    throw new Error("Can only cancel pending schedules");
  }

  await db
    .update(postSchedule)
    .set({ status: "cancelled" })
    .where(
      and(eq(postSchedule.id, scheduleId), eq(postSchedule.userId, userId))
    );

  return true;
}

export async function deleteSchedule(
  userId: string,
  scheduleId: number
): Promise<boolean> {
  const existing = await db.query.postSchedule.findFirst({
    where: and(
      eq(postSchedule.id, scheduleId),
      eq(postSchedule.userId, userId)
    ),
  });

  if (!existing) {
    return false;
  }

  if (!["cancelled", "failed"].includes(existing.status)) {
    throw new Error("Can only delete cancelled or failed schedules");
  }

  const [deleted] = await db
    .delete(postSchedule)
    .where(
      and(eq(postSchedule.id, scheduleId), eq(postSchedule.userId, userId))
    )
    .returning({ id: postSchedule.id });

  return Boolean(deleted);
}

export function getSchedulesByPostId(userId: string, postId: number) {
  return db.query.postSchedule.findMany({
    where: and(
      eq(postSchedule.postId, postId),
      eq(postSchedule.userId, userId)
    ),
    orderBy: [asc(postSchedule.scheduledAt)],
  });
}

export async function listSchedules(options: {
  userId: string;
  startDate: Date;
  endDate: Date;
  status?: typeof ScheduleStatus.static;
  limit?: number;
  offset?: number;
}) {
  const {
    userId,
    startDate,
    endDate,
    status,
    limit = 50,
    offset = 0,
  } = options;

  const conditions = [
    eq(postSchedule.userId, userId),
    gte(postSchedule.scheduledAt, startDate),
    lte(postSchedule.scheduledAt, endDate),
  ];

  if (status) {
    conditions.push(eq(postSchedule.status, status));
  }

  const whereClause = and(...conditions);

  const [schedules, [{ total }]] = await Promise.all([
    db.query.postSchedule.findMany({
      where: whereClause,
      orderBy: [asc(postSchedule.scheduledAt)],
      limit,
      offset,
      with: {
        post: {
          columns: {
            id: true,
            title: true,
            content: true,
            tags: true,
          },
        },
      },
    }),
    db.select({ total: count() }).from(postSchedule).where(whereClause),
  ]);

  return { schedules, total };
}

// ── Worker helpers ──────────────────────────────────────────────────────

export function getSchedulesDueForPublishing(): Promise<
  (typeof postSchedule.$inferSelect)[]
> {
  return db
    .select()
    .from(postSchedule)
    .where(
      and(
        eq(postSchedule.status, "pending"),
        isNotNull(postSchedule.scheduledAt),
        lte(postSchedule.scheduledAt, new Date())
      )
    );
}

export async function markScheduleProcessing(
  scheduleId: number
): Promise<boolean> {
  const [updated] = await db
    .update(postSchedule)
    .set({ status: "processing" })
    .where(
      and(eq(postSchedule.id, scheduleId), eq(postSchedule.status, "pending"))
    )
    .returning();

  return Boolean(updated);
}

export async function markSchedulePublished(
  scheduleId: number,
  publicationId: number
): Promise<void> {
  await db
    .update(postSchedule)
    .set({ status: "published", publicationId })
    .where(eq(postSchedule.id, scheduleId));
}

export async function markScheduleFailed(
  scheduleId: number,
  error: string,
  attempts: number
): Promise<void> {
  await db
    .update(postSchedule)
    .set({
      status: "failed",
      error,
      attempts,
    })
    .where(eq(postSchedule.id, scheduleId));
}

export async function resetStaleProcessingSchedules(): Promise<number> {
  const result = await db
    .update(postSchedule)
    .set({ status: "pending" })
    .where(eq(postSchedule.status, "processing"))
    .returning({ id: postSchedule.id });

  return result.length;
}

// ── Publish History ─────────────────────────────────────────────────────

export async function getPublishHistory(
  userId: string,
  postId: number,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  const existing = await getPostById(postId, userId);
  if (!existing) {
    return null;
  }

  const [publications, schedules] = await Promise.all([
    db.query.postPublication.findMany({
      where: eq(postPublication.postId, postId),
      orderBy: [desc(postPublication.publishedAt)],
    }),
    db.query.postSchedule.findMany({
      where: and(
        eq(postSchedule.postId, postId),
        eq(postSchedule.userId, userId)
      ),
      orderBy: [desc(postSchedule.scheduledAt)],
    }),
  ]);

  const schedulePublicationIds = new Set(
    schedules
      .filter((s) => s.publicationId !== null)
      .map((s) => s.publicationId)
  );

  type HistoryEntry = {
    id: number;
    postId: number;
    type: "scheduled" | "manual" | "direct";
    platform: string;
    publishedAt: string | null;
    scheduledAt?: string | null;
    status: string;
    error?: string | null;
    url?: string | null;
    platformPostId?: string | null;
    sortDate: Date;
  };

  const history: HistoryEntry[] = [];

  for (const pub of publications) {
    if (schedulePublicationIds.has(pub.id)) {
      continue;
    }

    const metadata = pub.metadata as Record<string, unknown> | null;
    const isManual = metadata?.manual === true;

    history.push({
      id: pub.id,
      postId: pub.postId,
      type: isManual ? "manual" : "direct",
      platform: pub.platform,
      publishedAt: pub.publishedAt.toISOString(),
      status: "published",
      url: pub.url,
      platformPostId: pub.platformPostId,
      sortDate: pub.publishedAt,
    });
  }

  for (const sched of schedules) {
    const entry: HistoryEntry = {
      id: sched.id,
      postId: sched.postId,
      type: "scheduled",
      platform: sched.platform,
      publishedAt: null,
      scheduledAt: sched.scheduledAt.toISOString(),
      status: sched.status,
      error: sched.error,
      sortDate: sched.scheduledAt,
    };

    if (sched.publicationId !== null) {
      const linkedPub = publications.find((p) => p.id === sched.publicationId);
      if (linkedPub) {
        entry.publishedAt = linkedPub.publishedAt.toISOString();
        entry.url = linkedPub.url;
        entry.platformPostId = linkedPub.platformPostId;
        entry.sortDate = linkedPub.publishedAt;
      }
    }

    history.push(entry);
  }

  history.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const total = history.length;
  const paged = history
    .slice(offset, offset + limit)
    .map(({ sortDate: _sortDate, ...rest }) => rest);

  return { history: paged, total };
}
