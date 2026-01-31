import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { Type, type Static } from '@sinclair/typebox';
import { post } from '../../db/schema';

// Derive insert schema, customize content validation
const _postInsert = createInsertSchema(post, {
	content: Type.String({ minLength: 1 }),
});

// PostCreate: for request body (omit auto-generated fields)
export const PostCreate = Type.Omit(_postInsert, [
	'id',
	'userId',
	'createdAt',
	'updatedAt',
]);
export type PostCreate = Static<typeof PostCreate>;

// PostUpdate: partial version for PATCH
export const PostUpdate = Type.Partial(
	Type.Omit(_postInsert, ['id', 'userId', 'createdAt', 'updatedAt']),
);
export type PostUpdate = Static<typeof PostUpdate>;

// Intermediate variable to avoid infinite type instantiation
const _postSelect = createSelectSchema(post);

// PostResponse: override date fields to strings for JSON serialization
const _postResponseBase = Type.Omit(_postSelect, ['createdAt', 'updatedAt']);

export const PostResponse = Type.Composite([
	_postResponseBase,
	Type.Object({
		createdAt: Type.String({ format: 'date-time' }),
		updatedAt: Type.String({ format: 'date-time' }),
	}),
]);
export type PostResponse = Static<typeof PostResponse>;

// PostListQuery & PostListResponse: keep manual (not direct table mappings)
export const PostStatus = Type.Union([
	Type.Literal('draft'),
	Type.Literal('published'),
	Type.Literal('archived'),
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
