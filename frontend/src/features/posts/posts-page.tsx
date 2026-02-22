import { IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useGetPosts } from "@/api/posts/posts";
import { Button } from "@/components/ui/button";
import PostList, {
  PostListEmpty,
  PostListError,
  PostListLoading,
} from "./post-list";

function PostDataContainer() {
  const { data, isPending, isError } = useGetPosts();

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
          <h1 className="font-bold text-2xl tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Manage and view all your posts.
          </p>
        </div>
        <Button asChild>
          <Link to="/posts/new">
            <IconPlus className="mr-2 size-4" />
            Create Post
          </Link>
        </Button>
      </div>
      <PostDataContainer />
    </div>
  );
}
