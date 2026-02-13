import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { post, postPublication } from "../../db/schema";
import { spread, spreads } from "../../db/utils";

const PostInsert = spread(
  createInsertSchema(post, {
    content: t.String({ minLength: 1 }),
  })
);

const { post: PostSelect, postPublication: PostPublicationSelect } = spreads(
  { post, postPublication },
  "select"
);

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
