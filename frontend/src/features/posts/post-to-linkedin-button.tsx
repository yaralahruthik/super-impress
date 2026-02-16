import { IconBrandLinkedin } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostLinkedinPost } from "@/api/linked-in/linked-in";
import { getGetPostsQueryKey } from "@/api/posts/posts";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/utils/get-error-message";

export default function PostToLinkedInButton({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = usePostLinkedinPost();

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
                  queryKey: getGetPostsQueryKey(),
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
