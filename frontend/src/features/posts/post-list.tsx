import type { PostPublic } from '@/api/superimpress.schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { FileText } from 'lucide-react';

export function PostListLoading() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{[...Array(6)].map((_, i) => (
				<Skeleton key={i} className="h-48 w-full rounded-xl" />
			))}
		</div>
	);
}

export function PostListError() {
	return (
		<div className="flex flex-col items-center justify-center p-6 text-center">
			<p className="text-destructive">Error loading posts. Please try again later.</p>
		</div>
	);
}

export function PostListEmpty() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FileText />
				</EmptyMedia>
				<EmptyTitle>No posts found</EmptyTitle>
				<EmptyDescription>You haven't created any posts yet.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild variant="outline">
					<Link to="/posts/new">Create your first post</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export default function PostList({ posts }: { posts: PostPublic[] }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{posts.map((post) => (
				<Card key={post.id} className="flex h-full flex-col transition-shadow hover:shadow-md">
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-1 overflow-hidden">
								<CardTitle className="truncate text-lg" title={post.title || 'Untitled'}>
									{post.title || <span className="text-muted-foreground italic">Untitled</span>}
								</CardTitle>
								<CardDescription className="text-xs">
									{new Date(post.created_at).toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</CardDescription>
							</div>
							<div
								className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${
									post.status === 'published'
										? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
										: post.status === 'draft'
											? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
											: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
								}`}
							>
								{post.status}
							</div>
						</div>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col gap-4">
						<p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>

						{post.tags && post.tags.length > 0 && (
							<div className="mt-auto flex flex-wrap gap-2 pt-2">
								{post.tags.slice(0, 3).map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground"
									>
										{tag}
									</span>
								))}
								{post.tags.length > 3 && (
									<span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground">
										+{post.tags.length - 3}
									</span>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
