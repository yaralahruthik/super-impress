import {
  IconAlertTriangle,
  IconBrandLinkedin,
  IconCheck,
  IconCopy,
  IconNotebook,
  IconTrash,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePostApiLinkedinPost } from "@/api/linked-in/linked-in";
import { useDeleteApiPostsById } from "@/api/posts/posts";
import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { getErrorMessage } from "@/utils/get-error-message";
import MarkAsPublishedDialog from "./mark-as-published-dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = usePostApiLinkedinPost();
  const { mutate: deletePost, isPending: isDeletePending } =
    useDeleteApiPostsById();
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

            <AlertDialog
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                if (!open) {
                  setDeleteError(null);
                }
              }}
              open={deleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <IconTrash className="size-4" />
                  Delete Post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <IconAlertTriangle className="size-5 text-destructive" />
                    Delete this post?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the post and all publication
                    history associated with it. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && (
                  <div
                    className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
                    role="alert"
                  >
                    {deleteError}
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeletePending}
                    onClick={(event) => {
                      event.preventDefault();
                      setDeleteError(null);
                      deletePost(
                        { id: post.id.toString() },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({
                              queryKey: ["/api/posts"],
                            });
                            setDeleteDialogOpen(false);
                          },
                          onError: (error) => {
                            setDeleteError(getErrorMessage(error));
                          },
                        }
                      );
                    }}
                  >
                    {isDeletePending ? "Deleting..." : "Delete Post"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {linkedInConnected && (
              <>
                <Button
                  disabled={isPending}
                  onClick={() =>
                    mutate(
                      { data: { postId: post.id.toString() } },
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
              <PublicationHistory
                postId={post.id}
                publications={publications}
              />
            </div>
          )}
        </div>
      </Card>

      <MarkAsPublishedDialog
        key={`${post.id}-${publications
          .map((publication) => publication.platform)
          .sort()
          .join("-")}`}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        postId={post.id}
      />
    </>
  );
}
