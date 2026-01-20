import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

export default function App() {
	return (
		<JotaiProvider>
			<QueryClientProvider client={queryClient}>
				<div>hello</div>
				<ReactQueryDevtools />
			</QueryClientProvider>
		</JotaiProvider>
	);
}
