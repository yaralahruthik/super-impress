import { createFileRoute } from "@tanstack/react-router";
import CreatePostPage from "@/features/posts/create-post-page";

export const Route = createFileRoute("/_protected/_app/posts/new")({
  component: CreatePostPage,
});
