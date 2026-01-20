import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { useAuth } from '@/hooks/use-auth';

interface RouterContext {
	auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent
});

function RootComponent() {
	return <Outlet />;
}
