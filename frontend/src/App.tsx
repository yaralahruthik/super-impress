import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

export default function App() {
	return (
		<JotaiProvider>
			<QueryClientProvider client={queryClient}>
				<div>hello</div>
			</QueryClientProvider>
		</JotaiProvider>
	);
}
