import { useDeleteCurrentUser } from '@/api/authentication/authentication';
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
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/utils/get-error-message';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteAccountCard() {
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { logout } = useAuth();
	const { mutate: deleteAccount, isPending } = useDeleteCurrentUser();

	const handleDelete = () => {
		setError(null);
		deleteAccount(undefined, {
			onSuccess: () => {
				logout();
				navigate({ to: '/login' });
			},
			onError: (error) => {
				setError(getErrorMessage(error));
			}
		});
	};

	return (
		<Card className="border-destructive/50">
			<CardHeader>
				<div className="flex items-center gap-2">
					<AlertTriangle className="size-5 text-destructive" />
					<CardTitle className="text-lg">Danger Zone</CardTitle>
				</div>
				<CardDescription>Permanently delete your account and all associated data</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Once you delete your account, there is no going back. All your posts, settings, and
					connected accounts will be permanently removed.
				</p>

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
						<Button variant="destructive" disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="size-4" />
									Delete Account
								</>
							)}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your account and remove
								all your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className="bg-destructive text-white hover:bg-destructive/90"
							>
								Delete Account
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
