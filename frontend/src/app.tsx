import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { Provider as JotaiProvider } from 'jotai';
import { useAuth } from './hooks/use-auth';
import { router } from './router';

const queryClient = new QueryClient();

function AppRoutes() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
	return (
		<JotaiProvider>
			<QueryClientProvider client={queryClient}>
				<AppRoutes />
				<ReactQueryDevtools />
			</QueryClientProvider>
		</JotaiProvider>
	);
}
