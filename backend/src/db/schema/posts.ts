import { relations } from 'drizzle-orm';
import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { account, user } from './auth';

export const postStatusEnum = pgEnum('post_status', [
	'draft',
	'published',
	'archived',
]);

export const socialPlatformEnum = pgEnum('social_platform', [
	'linkedin',
	'twitter',
	'facebook',
]);

export const post = pgTable(
	'post',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title'),
		content: text('content').notNull(),
		tags: text('tags').array().default([]).notNull(),
		status: postStatusEnum('status').default('draft').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('post_user_id_idx').on(table.userId),
		index('post_title_idx').on(table.title),
		index('post_status_idx').on(table.status),
	],
);

export const postPublication = pgTable(
	'post_publication',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		postId: uuid('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		platform: socialPlatformEnum('platform').notNull(),
		platformPostId: text('platform_post_id').notNull(),
		publishedAt: timestamp('published_at', { withTimezone: true })
			.defaultNow()
			.notNull(),
		accountId: text('account_id').references(() => account.id, {
			onDelete: 'cascade',
		}),
		metadata: jsonb('metadata'),
	},
	(table) => [
		uniqueIndex('post_publication_unique_idx').on(
			table.postId,
			table.platform,
			table.accountId,
		),
		index('post_publication_post_id_idx').on(table.postId),
		index('post_publication_platform_idx').on(table.platform),
		index('post_publication_account_id_idx').on(table.accountId),
	],
);

export const postRelations = relations(post, ({ one, many }) => ({
	user: one(user, { fields: [post.userId], references: [user.id] }),
	publications: many(postPublication),
}));

export const postPublicationRelations = relations(
	postPublication,
	({ one }) => ({
		post: one(post, {
			fields: [postPublication.postId],
			references: [post.id],
		}),
		account: one(account, {
			fields: [postPublication.accountId],
			references: [account.id],
		}),
	}),
);
