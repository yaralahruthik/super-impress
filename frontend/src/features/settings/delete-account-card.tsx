import { IconAlertTriangle, IconLoader2, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDeleteUser } from "@/api/better-auth/better-auth";
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
import { Input } from "@/components/ui/input";
import { authClient } from "@/utils/auth-client";
import { getErrorMessage } from "@/utils/get-error-message";

export default function DeleteAccountCard() {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { mutate: deleteAccount, isPending } = useDeleteUser();

  const handleDelete = () => {
    setError(null);
    deleteAccount(
      { data: { password } },
      {
        onSuccess: () => {
          authClient.signOut();
          navigate({ to: "/login" });
        },
        onError: (error) => {
          setError(getErrorMessage(error));
        },
      }
    );
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-5 text-destructive" />
          <CardTitle className="text-lg">Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Once you delete your account, there is no going back. All your posts,
          settings, and connected accounts will be permanently removed.
        </p>

        {error && (
          <div
            className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending} variant="destructive">
              {isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="size-4" />
                  Delete Account
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label className="font-medium text-sm" htmlFor="delete-password">
                Enter your password to confirm
              </label>
              <Input
                className="mt-2"
                id="delete-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={!password} onClick={handleDelete}>
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
