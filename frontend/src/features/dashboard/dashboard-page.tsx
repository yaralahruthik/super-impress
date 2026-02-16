import {
  IconAlertCircle,
  IconBrandLinkedin,
  IconCheck,
  IconFileText,
  IconNotes,
  IconPlus,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useGetSession } from "@/api/better-auth/better-auth";
import { useGetLinkedinStatus } from "@/api/linked-in/linked-in";
import { useGetPosts, useGetPostsSummary } from "@/api/posts/posts";
import type {
  PostListResponsePostsItem,
  PostSummaryResponse,
  User,
} from "@/api/superimpress.schemas";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_STYLES } from "@/constants";
import { cn } from "@/utils/classname";
import { formatDate } from "@/utils/format-date";

type StatusKey = "draft" | "published";

function StatusBadge({ status }: { status: string }) {
  const statusKey = status.toLowerCase() as StatusKey;
  const className =
    STATUS_STYLES[statusKey] || "bg-secondary text-secondary-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-xs",
        className
      )}
    >
      {status}
    </span>
  );
}

function DashboardDataContainer() {
  const {
    data: sessionData,
    isPending: sessionPending,
    isError: sessionError,
  } = useGetSession();
  const {
    data: postsData,
    isPending: postsPending,
    isError: postsError,
  } = useGetPosts();
  const {
    data: summaryData,
    isPending: summaryPending,
    isError: summaryError,
  } = useGetPostsSummary();
  const {
    data: linkedinStatus,
    isPending: linkedinPending,
    isError: linkedinError,
  } = useGetLinkedinStatus();

  if (sessionPending) {
    return <DashboardLoading />;
  }

  if (sessionError || !sessionData?.user) {
    return <DashboardSessionError />;
  }

  return (
    <DashboardContent
      linkedinError={linkedinError}
      linkedinPending={linkedinPending}
      linkedinStatus={linkedinStatus}
      postsData={postsData}
      postsError={postsError}
      postsPending={postsPending}
      summaryData={summaryData}
      summaryError={summaryError}
      summaryPending={summaryPending}
      user={sessionData.user}
      userName={sessionData.user.name}
    />
  );
}

function DashboardContent({
  user,
  userName,
  postsData,
  postsPending,
  postsError,
  summaryData,
  summaryPending,
  summaryError,
  linkedinStatus,
  linkedinPending,
  linkedinError,
}: {
  user: User;
  userName: string | null;
  postsData:
    | {
        posts: PostListResponsePostsItem[];
        total: number;
      }
    | undefined;
  postsPending: boolean;
  postsError: boolean;
  summaryData: PostSummaryResponse | undefined;
  summaryPending: boolean;
  summaryError: boolean;
  linkedinStatus: { connected: boolean; accountId?: string | null } | undefined;
  linkedinPending: boolean;
  linkedinError: boolean;
}) {
  const posts = postsData?.posts ?? [];
  const totalPosts =
    summaryData?.totalPosts ?? postsData?.total ?? posts.length;
  const draftCount =
    summaryData?.statusCounts.draft ??
    posts.filter((post) => post.status === "draft").length;
  const publishedCount =
    summaryData?.statusCounts.published ??
    posts.filter((post) => post.status === "published").length;
  const totalWordCount = summaryData?.totalWordCount ?? 0;
  const recentPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {userName ? `Welcome back, ${userName}.` : "Welcome back."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/posts/new">
              <IconPlus className="size-4" />
              Create Post
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/posts">
              <IconNotes className="size-4" />
              View Posts
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          description="All posts in your workspace"
          icon={IconFileText}
          isLoading={summaryPending}
          label="Total Posts"
          value={summaryPending || summaryError ? "--" : totalPosts}
        />
        <StatCard
          description="Drafts waiting to publish"
          icon={IconNotes}
          isLoading={summaryPending}
          label="Drafts"
          value={summaryPending || summaryError ? "--" : draftCount}
        />
        <StatCard
          description="Posts marked as published"
          icon={IconCheck}
          isLoading={summaryPending}
          label="Published"
          value={summaryPending || summaryError ? "--" : publishedCount}
        />
        <StatCard
          description="Total words across all posts"
          icon={IconFileText}
          isLoading={summaryPending}
          label="Word Count"
          value={summaryPending || summaryError ? "--" : totalWordCount}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>
                Latest posts you have created in SuperImpress.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/posts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentPostsBody
              posts={recentPosts}
              postsError={postsError}
              postsPending={postsPending}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <LinkedInStatusCard
            isError={linkedinError}
            isPending={linkedinPending}
            status={linkedinStatus}
          />
          <AccountSummary user={user} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  description,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  description: string;
  value: number | string;
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl">
            {isLoading ? <Skeleton className="mt-2 h-7 w-16" /> : value}
          </CardTitle>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground text-xs">
        {description}
      </CardContent>
    </Card>
  );
}

function RecentPostsLoading() {
  return (
    <div className="space-y-3">
      {[...new Array(4)].map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function RecentPostsBody({
  posts,
  postsPending,
  postsError,
}: {
  posts: PostListResponsePostsItem[];
  postsPending: boolean;
  postsError: boolean;
}) {
  if (postsPending) {
    return <RecentPostsLoading />;
  }

  if (postsError) {
    return <RecentPostsError />;
  }

  if (posts.length === 0) {
    return <RecentPostsEmpty />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/40"
          key={post.id}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">
                {post.title ?? "Untitled"}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDate(post.createdAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <StatusBadge status={post.status} />
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  className="rounded border px-2 py-0.5 text-muted-foreground"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RecentPostsEmpty() {
  return (
    <Empty className="border-none p-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFileText />
        </EmptyMedia>
        <EmptyTitle>No posts yet</EmptyTitle>
        <EmptyDescription>
          Your drafts and published posts will show up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/posts/new">Create your first post</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function RecentPostsError() {
  return (
    <div
      className="flex items-center gap-2 text-destructive text-sm"
      role="alert"
    >
      <IconAlertCircle className="size-4" />
      <span>Unable to load your posts right now.</span>
    </div>
  );
}

function LinkedInStatusCard({
  status,
  isPending,
  isError,
}: {
  status: { connected: boolean; accountId?: string | null } | undefined;
  isPending: boolean;
  isError: boolean;
}) {
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconBrandLinkedin className="size-4 text-[#0A66C2]" />
            LinkedIn
          </CardTitle>
          <CardDescription>Unable to check connection status.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const connected = status?.connected ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IconBrandLinkedin className="size-4 text-[#0A66C2]" />
          LinkedIn
        </CardTitle>
        <CardDescription>
          {connected ? "Connected and ready to publish." : "Not connected yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {connected ? (
            <>
              <IconCheck className="size-4 text-green-600" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <IconAlertCircle className="size-4" />
              <span>Connect to publish directly.</span>
            </>
          )}
        </div>
        <Button asChild size="sm" variant={connected ? "outline" : "default"}>
          <Link to="/settings">
            {connected ? "Manage Connection" : "Connect LinkedIn"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AccountSummary({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account</CardTitle>
        <CardDescription>Profile and security status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="truncate font-medium">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Verification</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              user.emailVerified
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            )}
          >
            {user.emailVerified ? "Verified" : "Unverified"}
          </span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/settings">Manage Account</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...new Array(4)].map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
          <Skeleton className="h-28 w-full" key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-80 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    </div>
  );
}

function DashboardSessionError() {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Error loading your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <IconAlertCircle className="size-8 text-destructive" />
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t load your session. Please refresh and try again.
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <ErrorBoundary>
        <DashboardDataContainer />
      </ErrorBoundary>
    </div>
  );
}
