import { useGetApiPosts } from '@/api/posts/posts';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import PostList, { PostListEmpty, PostListError, PostListLoading } from './post-list';

function PostDataContainer() {
	const { data, isPending, isError } = useGetApiPosts();

	if (isPending) {
		return <PostListLoading />;
	}

	if (isError) {
		return <PostListError />;
	}

	if (data.posts.length === 0) {
		return <PostListEmpty />;
	}

	return <PostList posts={data.posts} />;
}

export default function PostsPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Posts</h1>
					<p className="text-muted-foreground">Manage and view all your posts.</p>
				</div>
				<Button asChild>
					<Link to="/posts/new">
						<Plus className="mr-2 h-4 w-4" />
						Create Post
					</Link>
				</Button>
			</div>
			<PostDataContainer />
		</div>
	);
}
