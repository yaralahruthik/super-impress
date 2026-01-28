import type { User } from '@/api/superimpress.schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function UserInfoCard({ user }: { user: User }) {
	return (
		<Card className="max-w-md">
			<CardHeader>
				<CardTitle>User Information</CardTitle>
				<CardDescription>Your account details</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
					<span className="font-medium text-muted-foreground">ID:</span>
					<span>{user.id}</span>

					<span className="font-medium text-muted-foreground">Email:</span>
					<span>{user.email}</span>

					<span className="font-medium text-muted-foreground">Verified:</span>
					<span>
						{user.emailVerified ? (
							<span className="font-medium text-green-600">Yes</span>
						) : (
							<span className="font-medium text-yellow-600">No</span>
						)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function UserInfoCardLoading() {
	return (
		<Card className="max-w-md">
			<CardHeader>
				<CardTitle>User Information</CardTitle>
				<CardDescription>Your account details</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
					<span className="font-medium text-muted-foreground">ID:</span>
					<Skeleton className="h-5 w-full" />

					<span className="font-medium text-muted-foreground">Email:</span>
					<Skeleton className="h-5 w-full" />

					<span className="font-medium text-muted-foreground">Verified:</span>
					<Skeleton className="h-5 w-20" />
				</div>
			</CardContent>
		</Card>
	);
}

export function UserInfoCardError() {
	return (
		<Card className="max-w-md border-destructive/50">
			<CardHeader>
				<CardTitle>User Information</CardTitle>
				<CardDescription>Error loading details</CardDescription>
			</CardHeader>
			<CardContent className="justify-centertext-center flex flex-col items-center">
				<AlertCircle className="mb-2 size-8 text-destructive" />
				<p className="text-sm font-medium text-muted-foreground">Failed to load user information</p>
			</CardContent>
		</Card>
	);
}
