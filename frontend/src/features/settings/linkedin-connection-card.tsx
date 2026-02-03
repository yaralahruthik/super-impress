import { useLinkSocialAccount, usePostApiAuthUnlinkAccount } from '@/api/better-auth/better-auth';
import {
	getGetApiLinkedinStatusQueryKey,
	useGetApiLinkedinStatus
} from '@/api/linked-in/linked-in';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/utils/get-error-message';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Linkedin, Loader2, MessageCircle, Unlink } from 'lucide-react';
import { useState } from 'react';

export default function LinkedinConnectionCard() {
	const { data, isPending, isError } = useGetApiLinkedinStatus();

	if (isPending) {
		return <LinkedinConnectionCardLoading />;
	}

	if (isError) {
		return <LinkedinConnectionCardError />;
	}

	if (data?.connected) {
		return <LinkedinConnected email={data.email} accountId={data.accountId} />;
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
					provider: 'linkedin',
					callbackURL: 'http://localhost:5173/settings',
					errorCallbackURL: 'http://localhost:5173/settings',
					disableRedirect: true
				}
			},
			{
				onSuccess: (response) => {
					if (response.url) {
						window.location.href = response.url;
						return;
					}
					setError('Unable to start LinkedIn connection.');
				},
				onError: (error) => {
					setError(getErrorMessage(error));
				}
			}
		);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Linkedin className="size-5 text-[#0A66C2]" />
					<CardTitle className="text-lg">LinkedIn</CardTitle>
				</div>
				<CardDescription>Connect your LinkedIn account to publish posts directly</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<AlertCircle className="size-4" />
					<span>Not connected</span>
				</div>

				{error && (
					<div
						role="alert"
						className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						{error}
					</div>
				)}

				<Button onClick={handleConnect} disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Connecting...
						</>
					) : (
						<>
							<Linkedin className="size-4" />
							Connect LinkedIn
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}

function LinkedinConnected({
	email,
	accountId
}: {
	email: string | null | undefined;
	accountId: string | null | undefined;
}) {
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const { mutate: unlinkAccount, isPending } = usePostApiAuthUnlinkAccount();

	const handleDisconnect = () => {
		setError(null);
		unlinkAccount(
			{
				data: {
					providerId: 'linkedin'
				}
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: getGetApiLinkedinStatusQueryKey()
					});
				},
				onError: (error) => {
					setError(getErrorMessage(error));
				}
			}
		);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Linkedin className="size-5 text-[#0A66C2]" />
					<CardTitle className="text-lg">LinkedIn</CardTitle>
				</div>
				<CardDescription>Your LinkedIn account is connected</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2 text-sm text-green-600">
					<CheckCircle2 className="size-4" />
					<span>Connected</span>
				</div>

				<div className="space-y-2 text-sm text-muted-foreground">
					{email && (
						<div className="flex items-center gap-2">
							<MessageCircle className="size-4" />
							<span>Connected as {email}</span>
						</div>
					)}
					{!email && accountId && (
						<div className="flex items-center gap-2">
							<MessageCircle className="size-4" />
							<span>Linked account ID: {accountId}</span>
						</div>
					)}
				</div>

				{error && (
					<div
						role="alert"
						className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						{error}
					</div>
				)}

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline" disabled={isPending}>
							{isPending ? (
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
								You will no longer be able to publish posts directly to LinkedIn. You can reconnect
								at any time.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
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
					<Linkedin className="size-5 text-[#0A66C2]" />
					<CardTitle className="text-lg">LinkedIn</CardTitle>
				</div>
				<CardDescription>Failed to load connection status</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col items-center justify-center text-center">
				<AlertCircle className="mb-2 size-8 text-destructive" />
				<p className="text-sm font-medium text-muted-foreground">
					Unable to check LinkedIn connection status
				</p>
			</CardContent>
		</Card>
	);
}
