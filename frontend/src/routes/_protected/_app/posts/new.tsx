import CreatePostPage from '@/features/posts/create-post-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/posts/new')({
	component: CreatePostPage
});
