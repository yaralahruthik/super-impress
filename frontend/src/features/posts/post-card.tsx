import {
  IconBrandLinkedin,
  IconCheck,
  IconCopy,
  IconNotebook,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePostApiLinkedinPost } from "@/api/linked-in/linked-in";
import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/classname";
import { getErrorMessage } from "@/utils/get-error-message";
import MarkAsPublishedDialog from "./mark-as-published-dialog";
import PublicationHistory from "./publication-history";

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    published: "bg-green-100 text-green-800 border-green-200",
    archived: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusKey = status.toLowerCase() as keyof typeof styles;
  const className =
    styles[statusKey] || "bg-secondary text-secondary-foreground";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = usePostApiLinkedinPost();
  const publications = post.publications ?? [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
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
            <Button
              onClick={handleCopy}
              size="sm"
              title="Copy post"
              variant="outline"
            >
              {copied ? (
                <IconCheck className="size-4" />
              ) : (
                <IconCopy className="size-4" />
              )}
              {copied ? "Copied" : "Copy Post"}
            </Button>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <IconNotebook className="size-4" />
              Mark as Published
            </Button>

            {linkedInConnected && (
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
                  <IconBrandLinkedin className="size-4" />
                  {isPending ? "Posting..." : "Post to LinkedIn"}
                </Button>
                {error && (
                  <p className="w-full text-destructive text-xs">
                    {getErrorMessage(error)}
                  </p>
                )}
              </>
            )}
          </div>

          {publications.length > 0 && (
            <div className="mt-3">
              <PublicationHistory publications={publications} />
            </div>
          )}
        </div>
      </Card>

      <MarkAsPublishedDialog
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        postId={post.id}
      />
    </>
  );
}
