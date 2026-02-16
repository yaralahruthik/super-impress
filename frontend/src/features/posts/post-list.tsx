import { IconFileText } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Masonry } from "masonic";
import { useMemo } from "react";
import { useGetApiLinkedinStatus } from "@/api/linked-in/linked-in";
import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "./post-card";

type MasonryItem = PostListResponsePostsItem & {
  linkedInConnected: boolean;
};

function MasonryCard({ data }: { data: MasonryItem }) {
  return <PostCard linkedInConnected={data.linkedInConnected} post={data} />;
}

export function PostListLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...new Array(6)].map((_, i) => (
        <Skeleton
          className="h-48 w-full rounded-xl"
          // biome-ignore lint/suspicious/noArrayIndexKey: okay for skeleton
          key={i}
        />
      ))}
    </div>
  );
}

export function PostListError() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <p className="text-destructive">
        Error loading posts. Please try again later.
      </p>
    </div>
  );
}

export function PostListEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFileText />
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

export default function PostList({
  posts,
}: {
  posts: PostListResponsePostsItem[];
}) {
  const { data: linkedInStatus } = useGetApiLinkedinStatus();
  const linkedInConnected = linkedInStatus?.connected ?? false;

  const items = useMemo(
    () => posts.map((post) => ({ ...post, linkedInConnected })),
    [posts, linkedInConnected]
  );

  return (
    <Masonry
      columnGutter={16}
      columnWidth={340}
      items={items}
      render={MasonryCard}
    />
  );
}
