import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import DeleteAccountCard from './delete-account-card';
import LinkedinConnectionCard from './linkedin-connection-card';

export default function SettingsPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">Manage your account settings and integrations</p>
			</div>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold">Security</h2>
				<Link to="/change-password">
					<Card className="max-w-md transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>Update your account password</CardDescription>
						</CardHeader>
					</Card>
				</Link>
			</section>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold">Integrations</h2>
				<LinkedinConnectionCard />
			</section>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold">Danger Zone</h2>
				<DeleteAccountCard />
			</section>
		</div>
	);
}
