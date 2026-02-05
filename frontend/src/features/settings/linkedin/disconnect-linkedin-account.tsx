import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Unlink } from "lucide-react";
import { usePostApiAuthUnlinkAccount } from "@/api/better-auth/better-auth";
import { getGetApiLinkedinStatusQueryKey } from "@/api/linked-in/linked-in";
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
import { getLinkedAccountInfoQueryKey } from "./use-linked-account-info";

export default function DisconnectLinkedinAccount({
  accountId,
}: {
  accountId: string;
}) {
  const queryClient = useQueryClient();
  const {
    mutate: unlinkAccount,
    isPending: unlinkPending,
    error,
  } = usePostApiAuthUnlinkAccount();

  const handleDisconnect = () => {
    unlinkAccount(
      {
        data: {
          providerId: "linkedin",
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetApiLinkedinStatusQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getLinkedAccountInfoQueryKey(accountId),
          });
        },
      }
    );
  };

  return (
    <>
      {error && (
        <div
          className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
          role="alert"
        >
          {getErrorMessage(error)}
        </div>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={unlinkPending} variant="outline">
            {unlinkPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Unlink className="size-4" />
                Disconnect
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect LinkedIn?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be able to publish posts directly to LinkedIn.
              You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
