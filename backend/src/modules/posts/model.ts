import { type Static, Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { DEFAULT_POSTS_LIMIT } from "../../constants";
import { post } from "../../db/schema";

// Derive insert schema, customize content validation
const _postInsert = createInsertSchema(post, {
  content: Type.String({ minLength: 1 }),
});

// PostCreate: for request body (omit auto-generated fields)
export const PostCreate = Type.Omit(_postInsert, [
  "id",
  "userId",
  "createdAt",
  "updatedAt",
]);
export type PostCreate = Static<typeof PostCreate>;

// PostUpdate: partial version for PATCH
export const PostUpdate = Type.Partial(
  Type.Omit(_postInsert, ["id", "userId", "createdAt", "updatedAt"])
);
export type PostUpdate = Static<typeof PostUpdate>;

// Intermediate variable to avoid infinite type instantiation
const _postSelect = createSelectSchema(post);

// Reusable platform schema derived from database enum
export const PlatformSchema = Type.Union([
  Type.Literal("linkedin"),
  Type.Literal("twitter"),
  Type.Literal("threads"),
  Type.Literal("peerlist"),
]);
export type Platform = Static<typeof PlatformSchema>;

// Publication schema for including in post response
export const Publication = Type.Object({
  id: Type.String(),
  platform: PlatformSchema,
  platformPostId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  url: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  accountId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  publishedAt: Type.String({ format: "date-time" }),
});
export type Publication = Static<typeof Publication>;

// Manual publication request/response schemas
export const ManualPublicationRequest = Type.Object({
  platform: PlatformSchema,
  url: Type.String({ format: "uri" }),
});
export type ManualPublicationRequest = Static<typeof ManualPublicationRequest>;

export const ManualPublicationResponse = Type.Object({
  id: Type.String(),
  postId: Type.String(),
  platform: PlatformSchema,
  url: Type.Union([Type.String(), Type.Null()]),
  publishedAt: Type.String({ format: "date-time" }),
});
export type ManualPublicationResponse = Static<
  typeof ManualPublicationResponse
>;

export const PostStatus = Type.Union([
  Type.Literal("draft"),
  Type.Literal("published"),
]);
export type PostStatus = Static<typeof PostStatus>;

// PostResponse: override date fields to strings for JSON serialization
const _postResponseBase = Type.Omit(_postSelect, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const PostResponse = Type.Composite([
  _postResponseBase,
  Type.Object({
    id: Type.String(),
    status: PostStatus,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    publications: Type.Optional(Type.Array(Publication)),
  }),
]);
export type PostResponse = Static<typeof PostResponse>;

// PostListQuery & PostListResponse: keep manual (not direct table mappings)
export const PostListQuery = Type.Object({
  status: Type.Optional(PostStatus),
  tag: Type.Optional(Type.String()),
  limit: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: DEFAULT_POSTS_LIMIT,
      default: DEFAULT_POSTS_LIMIT,
    })
  ),
  offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});
export type PostListQuery = Static<typeof PostListQuery>;

export const PostListResponse = Type.Object({
  posts: Type.Array(PostResponse),
  total: Type.Number(),
});
export type PostListResponse = Static<typeof PostListResponse>;

export const PostStatusCounts = Type.Object({
  draft: Type.Number(),
  published: Type.Number(),
});
export type PostStatusCounts = Static<typeof PostStatusCounts>;

export const PostSummaryResponse = Type.Object({
  totalPosts: Type.Number(),
  totalWordCount: Type.Number(),
  statusCounts: PostStatusCounts,
});
export type PostSummaryResponse = Static<typeof PostSummaryResponse>;
