import { and, arrayContains, count, desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { post } from '../../db/schema';
import type { PostCreate, PostStatus, PostUpdate } from './model';

export async function createPost(
	userId: string,
	data: PostCreate,
): Promise<typeof post.$inferSelect> {
	const [newPost] = await db
		.insert(post)
		.values({
			userId,
			title: data.title ?? null,
			content: data.content,
			tags: data.tags ?? [],
			status: data.status ?? 'draft',
		})
		.returning();

	return newPost;
}

export async function getPostById(
	postId: string,
	userId: string,
): Promise<typeof post.$inferSelect | null> {
	const [result] = await db
		.select()
		.from(post)
		.where(and(eq(post.id, postId), eq(post.userId, userId)))
		.limit(1);

	return result ?? null;
}

export async function listUserPosts(options: {
	userId: string;
	status?: PostStatus;
	tag?: string;
	limit?: number;
	offset?: number;
}): Promise<{ posts: (typeof post.$inferSelect)[]; total: number }> {
	const { userId, status, tag, limit = 100, offset = 0 } = options;

	const conditions = [eq(post.userId, userId)];

	if (status) {
		conditions.push(eq(post.status, status));
	}

	if (tag) {
		conditions.push(arrayContains(post.tags, [tag]));
	}

	const whereClause = and(...conditions);

	const [posts, [{ total }]] = await Promise.all([
		db
			.select()
			.from(post)
			.where(whereClause)
			.orderBy(desc(post.createdAt))
			.limit(limit)
			.offset(offset),
		db.select({ total: count() }).from(post).where(whereClause),
	]);

	return { posts, total };
}

export async function updatePost(
	postId: string,
	userId: string,
	data: PostUpdate,
): Promise<typeof post.$inferSelect | null> {
	const existing = await getPostById(postId, userId);
	if (!existing) return null;

	const [updated] = await db
		.update(post)
		.set(data)
		.where(and(eq(post.id, postId), eq(post.userId, userId)))
		.returning();

	return updated ?? null;
}

export async function deletePost(
	postId: string,
	userId: string,
): Promise<boolean> {
	const existing = await getPostById(postId, userId);
	if (!existing) return false;

	await db
		.delete(post)
		.where(and(eq(post.id, postId), eq(post.userId, userId)));

	return true;
}
