import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_STYLES } from "@/constants";
import { cn } from "@/utils/classname";
import { formatDate } from "@/utils/format-date";
import { CopyPostButton } from "./copy-post-button";
import { DeletePostButton } from "./delete-post-button";
import { MarkAsPublishedButton } from "./mark-as-published-button";
import { PostToLinkedInButton } from "./post-to-linkedin-button";
import PublicationHistory from "./publication-history";

function StatusBadge({ status }: { status: string }) {
  const statusKey = status.toLowerCase() as keyof typeof STATUS_STYLES;
  const className =
    STATUS_STYLES[statusKey] || "bg-secondary text-secondary-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {status}
    </span>
  );
}

export function PostCard({
  post,
  linkedInConnected,
}: {
  post: PostListResponsePostsItem;
  linkedInConnected: boolean;
}) {
  const publications = post.publications ?? [];

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
              {formatDate(post.createdAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <StatusBadge status={post.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <p className="whitespace-pre-wrap text-muted-foreground text-sm">
            {post.content}
          </p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <span
                className="inline-flex items-center rounded-md border px-2 py-1 font-medium text-foreground text-xs transition-colors hover:bg-secondary/50"
                key={tag}
              >
                <span className="mr-1 text-muted-foreground">#</span>
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <div className="border-t px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <CopyPostButton content={post.content} />
          <MarkAsPublishedButton postId={post.id} publications={publications} />
          <DeletePostButton postId={post.id} />
          {linkedInConnected && <PostToLinkedInButton postId={post.id} />}
        </div>

        {publications.length > 0 && (
          <div className="mt-3">
            <PublicationHistory postId={post.id} publications={publications} />
          </div>
        )}
      </div>
    </Card>
  );
}
