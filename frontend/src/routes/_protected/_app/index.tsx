import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/')({
	component: HomePage
});

function HomePage() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold">Welcome to Super Impress</h1>
				<p className="mt-4 text-muted-foreground">You are logged in!</p>
			</div>
		</div>
	);
}
