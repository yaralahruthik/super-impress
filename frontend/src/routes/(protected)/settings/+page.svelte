<script lang="ts">
	import { createGetLinkedinStatus } from '$lib/api/linkedin/linkedin';
	import LinkedInConnectionCard from '$lib/features/linkedin/linkedin-connection-card.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';

	const statusQuery = createGetLinkedinStatus();
</script>

<AppLayout>
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-base-content/60">Manage your account integrations and preferences.</p>
	</div>

	<div class="max-w-4xl space-y-8">
		<section>
			<div class="mb-4 flex items-center gap-2">
				<h2 class="text-xl font-bold tracking-tight">Integrations</h2>
				<div class="ml-2 h-px flex-1 bg-base-content/10"></div>
			</div>

			<LinkedInConnectionCard
				status={statusQuery.data || { connected: false }}
				loading={statusQuery.isLoading}
			/>
		</section>
	</div>
</AppLayout>
