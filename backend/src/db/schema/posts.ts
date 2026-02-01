import { relations } from 'drizzle-orm';
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const postStatusEnum = pgEnum('post_status', [
	'draft',
	'published',
	'archived',
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

export const postRelations = relations(post, ({ one }) => ({
	user: one(user, { fields: [post.userId], references: [user.id] }),
}));
