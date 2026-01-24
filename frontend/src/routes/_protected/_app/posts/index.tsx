import PostsPage from '@/features/posts/posts-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/posts/')({
	component: PostsPage
});
