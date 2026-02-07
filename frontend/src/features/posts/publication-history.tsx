import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDeleteApiPostsByIdPublicationsByPublicationId } from "@/api/posts/posts";
import type { PostListResponsePostsItemPublicationsItem } from "@/api/superimpress.schemas";
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
import { constructSocialLink } from "@/utils/construct-social-links";
import { formatDate } from "@/utils/format-date";
import { getErrorMessage } from "@/utils/get-error-message";
import { getPlatformIcon, getPlatformLabel } from "./utils";

function PublicationHistoryItem({
  publication,
  postId,
}: {
  publication: PostListResponsePostsItemPublicationsItem;
  postId: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } =
    useDeleteApiPostsByIdPublicationsByPublicationId();
  const Icon = getPlatformIcon(publication.platform);
  const label = getPlatformLabel(publication.platform);
  const isManual = !publication.accountId;
  const resolvedUrl = constructSocialLink({
    platform: publication.platform,
    platformPostId: publication.platformPostId,
    url: publication.url,
  });

  return (
    <li className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="font-medium">{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
          isManual
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {isManual ? "Manual" : "Via linked account"}
      </span>
      {resolvedUrl && (
        <a
          className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          href={resolvedUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconExternalLink className="size-3" />
        </a>
      )}
      <span className="text-muted-foreground">
        {formatDate(publication.publishedAt, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
      <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            aria-label="Delete publication history item"
            size="icon-xs"
            variant="ghost"
          >
            <IconTrash className="size-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete publication entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the history entry from this post. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div
              className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
              role="alert"
            >
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                setError(null);
                mutate(
                  { id: postId, publicationId: publication.id },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["/api/posts"],
                      });
                      setDialogOpen(false);
                    },
                    onError: (error) => {
                      setError(getErrorMessage(error));
                    },
                  }
                );
              }}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export default function PublicationHistory({
  publications,
  postId,
}: {
  publications: PostListResponsePostsItemPublicationsItem[];
  postId: string;
}) {
  if (publications.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">No publications yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {publications.map((publication) => (
        <PublicationHistoryItem
          key={publication.id}
          postId={postId}
          publication={publication}
        />
      ))}
    </ul>
  );
}
