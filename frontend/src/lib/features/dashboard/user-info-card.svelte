<script lang="ts">
	import type { UserPublic } from '$lib/api/superimpress.schemas';

	type Props = {
		user: UserPublic;
	};

	let { user }: Props = $props();
</script>

<div class="card w-full max-w-md bg-base-200 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">User Information</h2>

		<div class="divider"></div>

		<div class="space-y-4">
			<div class="flex flex-col">
				<span class="text-sm font-semibold text-base-content/70">Email</span>
				<span class="text-lg" data-testid="user-email">{user.email}</span>
			</div>

			<div class="flex flex-col">
				<span class="text-sm font-semibold text-base-content/70">User ID</span>
				<span class="font-mono text-lg" data-testid="user-id">{user.id}</span>
			</div>
		</div>
	</div>
</div>
