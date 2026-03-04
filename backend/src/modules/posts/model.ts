import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { post, postPublication, postSchedule } from "../../db/schema";
import { spread, spreads } from "../../db/utils";

const PostInsert = spread(
  createInsertSchema(post, {
    content: t.String({ minLength: 1 }),
  })
);

const {
  post: PostSelect,
  postPublication: PostPublicationSelect,
  postSchedule: PostScheduleSelect,
} = spreads({ post, postPublication, postSchedule }, "select");

export const PostCreate = t.Object({
  title: PostInsert.title,
  content: PostInsert.content,
  tags: PostInsert.tags,
});

export const PostUpdate = t.Partial(PostCreate);

export const PlatformSchema = PostPublicationSelect.platform;

export const Publication = t.Object({
  id: PostPublicationSelect.id,
  platform: PostPublicationSelect.platform,
  platformPostId: PostPublicationSelect.platformPostId,
  url: PostPublicationSelect.url,
  accountId: PostPublicationSelect.accountId,
  publishedAt: PostPublicationSelect.publishedAt,
});

export const ManualPublicationRequest = t.Object({
  platform: PlatformSchema,
  url: t.String({ format: "uri" }),
});

export const ManualPublicationResponse = t.Object({
  id: PostPublicationSelect.id,
  postId: PostPublicationSelect.postId,
  platform: PostPublicationSelect.platform,
  url: PostPublicationSelect.url,
  publishedAt: PostPublicationSelect.publishedAt,
});

export const PostStatus = t.Union([t.Literal("draft"), t.Literal("published")]);

export const PostResponse = t.Object({
  id: PostSelect.id,
  userId: PostSelect.userId,
  title: PostSelect.title,
  content: PostSelect.content,
  tags: PostSelect.tags,
  createdAt: PostSelect.createdAt,
  updatedAt: PostSelect.updatedAt,
  status: PostStatus,
  publications: t.Optional(t.Array(Publication)),
});

export const PostListQuery = t.Object({
  status: t.Optional(PostStatus),
  tag: t.Optional(t.String()),
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: DEFAULT_POSTS_LIMIT,
      default: DEFAULT_POSTS_LIMIT,
    })
  ),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const PostListResponse = t.Object({
  posts: t.Array(PostResponse),
  total: t.Number(),
});

export const PostStatusCounts = t.Object({
  draft: t.Number(),
  published: t.Number(),
});

export const PostSummaryResponse = t.Object({
  totalPosts: t.Number(),
  totalWordCount: t.Number(),
  statusCounts: PostStatusCounts,
});

// Schedule schemas

export const ScheduleStatus = t.Union([
  t.Literal("pending"),
  t.Literal("processing"),
  t.Literal("published"),
  t.Literal("failed"),
  t.Literal("cancelled"),
]);

export const CreateScheduleRequest = t.Object({
  scheduledAt: t.String({ format: "date-time" }),
  platform: PlatformSchema,
  accountId: t.String({ minLength: 1 }),
});

export const UpdateScheduleRequest = t.Object({
  scheduledAt: t.String({ format: "date-time" }),
});

export const ScheduleResponse = t.Object({
  id: PostScheduleSelect.id,
  postId: PostScheduleSelect.postId,
  platform: PostScheduleSelect.platform,
  accountId: t.Nullable(PostScheduleSelect.accountId),
  scheduledAt: PostScheduleSelect.scheduledAt,
  status: PostScheduleSelect.status,
  error: t.Nullable(PostScheduleSelect.error),
  attempts: PostScheduleSelect.attempts,
  publicationId: t.Nullable(PostScheduleSelect.publicationId),
  createdAt: PostScheduleSelect.createdAt,
});

export const ScheduleListQuery = t.Object({
  startDate: t.String({ format: "date-time" }),
  endDate: t.String({ format: "date-time" }),
  status: t.Optional(ScheduleStatus),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const ScheduleListResponse = t.Object({
  schedules: t.Array(
    t.Object({
      ...ScheduleResponse.properties,
      post: t.Object({
        id: PostSelect.id,
        title: PostSelect.title,
        content: PostSelect.content,
        tags: PostSelect.tags,
      }),
    })
  ),
  total: t.Number(),
});

// Publish history schemas

export const PublishHistoryEntry = t.Object({
  id: t.Number(),
  postId: t.Number(),
  type: t.Union([
    t.Literal("scheduled"),
    t.Literal("manual"),
    t.Literal("direct"),
  ]),
  platform: t.String(),
  publishedAt: t.Nullable(t.String({ format: "date-time" })),
  scheduledAt: t.Optional(t.Nullable(t.String({ format: "date-time" }))),
  status: t.String(),
  error: t.Optional(t.Nullable(t.String())),
  url: t.Optional(t.Nullable(t.String())),
  platformPostId: t.Optional(t.Nullable(t.String())),
});

export const PublishHistoryQuery = t.Object({
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const PublishHistoryResponse = t.Object({
  history: t.Array(PublishHistoryEntry),
  total: t.Number(),
});
