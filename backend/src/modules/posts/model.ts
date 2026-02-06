import { type Static, Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
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

// Publication schema for including in post response
export const Publication = Type.Object({
  id: Type.String({ format: "uuid" }),
  platform: Type.Union([
    Type.Literal("linkedin"),
    Type.Literal("twitter"),
    Type.Literal("facebook"),
    Type.Literal("instagram"),
  ]),
  platformPostId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  url: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  accountId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  publishedAt: Type.String({ format: "date-time" }),
});
export type Publication = Static<typeof Publication>;

// Manual publication request/response schemas
export const ManualPublicationRequest = Type.Object({
  platform: Type.Union([
    Type.Literal("linkedin"),
    Type.Literal("twitter"),
    Type.Literal("facebook"),
    Type.Literal("instagram"),
  ]),
  url: Type.String({ format: "uri" }),
});
export type ManualPublicationRequest = Static<typeof ManualPublicationRequest>;

export const ManualPublicationResponse = Type.Object({
  id: Type.String({ format: "uuid" }),
  postId: Type.String({ format: "uuid" }),
  platform: Type.Union([
    Type.Literal("linkedin"),
    Type.Literal("twitter"),
    Type.Literal("facebook"),
    Type.Literal("instagram"),
  ]),
  url: Type.Union([Type.String(), Type.Null()]),
  publishedAt: Type.String({ format: "date-time" }),
});
export type ManualPublicationResponse = Static<
  typeof ManualPublicationResponse
>;

// PostResponse: override date fields to strings for JSON serialization
const _postResponseBase = Type.Omit(_postSelect, ["createdAt", "updatedAt"]);

export const PostResponse = Type.Composite([
  _postResponseBase,
  Type.Object({
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    publications: Type.Optional(Type.Array(Publication)),
  }),
]);
export type PostResponse = Static<typeof PostResponse>;

// PostListQuery & PostListResponse: keep manual (not direct table mappings)
export const PostStatus = Type.Union([
  Type.Literal("draft"),
  Type.Literal("published"),
  Type.Literal("archived"),
]);
export type PostStatus = Static<typeof PostStatus>;

export const PostListQuery = Type.Object({
  status: Type.Optional(PostStatus),
  tag: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 100 })),
  offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});
export type PostListQuery = Static<typeof PostListQuery>;

export const PostListResponse = Type.Object({
  posts: Type.Array(PostResponse),
  total: Type.Number(),
});
export type PostListResponse = Static<typeof PostListResponse>;
