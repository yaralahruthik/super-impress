import {
  IconAlertCircle,
  IconBrandLinkedin,
  IconLoader2,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { useLinkSocialAccount } from "@/api/better-auth/better-auth";
import { useGetApiLinkedinStatus } from "@/api/linked-in/linked-in";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/utils/get-error-message";
import DisconnectLinkedinAccount from "./disconnect-linkedin-account";
import { useLinkedAccountInfo } from "./use-linked-account-info";

export default function LinkedinConnectionCard() {
  const { data, isPending, isError } = useGetApiLinkedinStatus();

  if (isPending) {
    return <LinkedinConnectionCardLoading />;
  }

  if (isError) {
    return <LinkedinConnectionCardError />;
  }

  if (data.connected && data.accountId) {
    return <LinkedinConnected accountId={data.accountId} />;
  }

  return <LinkedinNotConnected />;
}

function LinkedinNotConnected() {
  const [error, setError] = useState<string | null>(null);
  const { mutate: linkSocialAccount, isPending } = useLinkSocialAccount();

  const handleConnect = () => {
    setError(null);
    linkSocialAccount(
      {
        data: {
          provider: "linkedin",
          callbackURL: "http://localhost:5173/settings",
          errorCallbackURL: "http://localhost:5173/settings",
          scopes: ["w_member_social"],
        },
      },
      {
        onSuccess: (response) => {
          if (response.url) {
            window.location.href = response.url;
            return;
          }
          setError("Unable to start LinkedIn connection.");
        },
        onError: (error) => {
          setError(getErrorMessage(error));
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBrandLinkedin className="size-5 text-[#0A66C2]" />
          <CardTitle className="text-lg">LinkedIn</CardTitle>
        </div>
        <CardDescription>
          Connect your LinkedIn account to publish posts directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <IconAlertCircle className="size-4" />
          <span>Not connected</span>
        </div>

        {error && (
          <div
            className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button disabled={isPending} onClick={handleConnect}>
          {isPending ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <IconBrandLinkedin className="size-4" />
              Connect LinkedIn
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function LinkedinConnected({ accountId }: { accountId: string }) {
  const {
    data,
    isPending,
    isError,
    error: accountInfoError,
  } = useLinkedAccountInfo(accountId);
  const email = data?.user?.email;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBrandLinkedin className="size-5 text-[#0A66C2]" />
          <CardTitle className="text-lg">LinkedIn</CardTitle>
        </div>
        <CardDescription>Your LinkedIn account is connected</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-muted-foreground text-sm">
          {!accountId && (
            <div className="flex items-center gap-2">
              <IconMessageCircle className="size-4" />
              <span>Linked account ID unavailable</span>
            </div>
          )}
          {isPending && (
            <div className="flex items-center gap-2">
              <IconMessageCircle className="size-4" />
              <Skeleton className="h-4 w-40" />
            </div>
          )}
          {isError && (
            <div
              className="flex items-center gap-2 text-destructive"
              role="alert"
            >
              <IconAlertCircle className="size-4" />
              <span>
                {accountInfoError instanceof Error
                  ? accountInfoError.message
                  : "Unable to load account info."}
              </span>
            </div>
          )}
          {!(isPending || isError) && email && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage
                    alt={data.user.name ?? email}
                    src={data.user.image}
                  />
                  <AvatarFallback>
                    {(data.user.name ?? email)[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{email}</span>
              </div>
            </div>
          )}
          {!(isPending || isError || email) && accountId && (
            <div className="flex items-center gap-2">
              <IconMessageCircle className="size-4" />
              <span>Linked account ID: {accountId}</span>
            </div>
          )}
        </div>

        <DisconnectLinkedinAccount accountId={accountId} />
      </CardContent>
    </Card>
  );
}

function LinkedinConnectionCardLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-36" />
      </CardContent>
    </Card>
  );
}

function LinkedinConnectionCardError() {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBrandLinkedin className="size-5 text-[#0A66C2]" />
          <CardTitle className="text-lg">LinkedIn</CardTitle>
        </div>
        <CardDescription>Failed to load connection status</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center">
        <IconAlertCircle className="mb-2 size-8 text-destructive" />
        <p className="font-medium text-muted-foreground text-sm">
          Unable to check LinkedIn connection status
        </p>
      </CardContent>
    </Card>
  );
}
