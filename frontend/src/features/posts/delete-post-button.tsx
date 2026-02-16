import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getGetPostsQueryKey, useDeletePostsById } from "@/api/posts/posts";
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
import { getErrorMessage } from "@/utils/get-error-message";

export default function DeletePostButton({ postId }: { postId: number }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate: deletePost, isPending: isDeletePending } =
    useDeletePostsById();

  return (
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
            This will permanently delete the post and all publication history
            associated with it. This action cannot be undone.
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
                { id: postId.toString() },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: getGetPostsQueryKey(),
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
  );
}
