import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, FileText, Linkedin } from "lucide-react";
import {
  useGetApiLinkedinStatus,
  usePostApiLinkedinPost,
} from "@/api/linked-in/linked-in";
import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/utils/get-error-message";

export function PostListLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...new Array(6)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: okay for skeleton
        <Skeleton className="h-48 w-full rounded-xl" key={i} />
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

function PostCard({
  post,
  linkedInConnected,
}: {
  post: PostListResponsePostsItem;
  linkedInConnected: boolean;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = usePostApiLinkedinPost();
  const alreadyPosted = post.publications?.some(
    (p) => p.platform === "linkedin"
  );

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 overflow-hidden">
            <CardTitle
              className="truncate text-lg"
              title={post.title || "Untitled"}
            >
              {post.title || (
                <span className="text-muted-foreground italic">Untitled</span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <div>{post.status}</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 font-medium text-secondary-foreground text-xs"
                key={tag}
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 font-medium text-secondary-foreground text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
      {linkedInConnected && (
        <div className="border-t px-6 py-4">
          {alreadyPosted ? (
            <p className="flex items-center gap-1.5 text-green-600 text-sm dark:text-green-400">
              <Check className="h-4 w-4" />
              Posted to LinkedIn
            </p>
          ) : (
            <>
              <Button
                disabled={isPending}
                onClick={() =>
                  mutate(
                    { data: { postId: post.id } },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["/api/posts"],
                        });
                      },
                    }
                  )
                }
                size="sm"
                variant="outline"
              >
                <Linkedin className="h-4 w-4" />
                {isPending ? "Posting…" : "Post to LinkedIn"}
              </Button>
              {error && (
                <p className="mt-2 text-destructive text-xs">
                  {getErrorMessage(error)}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default function PostList({
  posts,
}: {
  posts: PostListResponsePostsItem[];
}) {
  const { data: linkedInStatus } = useGetApiLinkedinStatus();
  const linkedInConnected = linkedInStatus?.connected ?? false;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          linkedInConnected={linkedInConnected}
          post={post}
        />
      ))}
    </div>
  );
}
