import { IconBrandLinkedin } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostApiLinkedinPost } from "@/api/linked-in/linked-in";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/utils/get-error-message";

export function PostToLinkedInButton({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = usePostApiLinkedinPost();

  return (
    <>
      <Button
        disabled={isPending}
        onClick={() =>
          mutate(
            { data: { postId: postId.toString() } },
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
  );
}
