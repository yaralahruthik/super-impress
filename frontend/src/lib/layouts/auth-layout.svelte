<script>
	import { resolve } from '$app/paths';
</script>

<div class="container mx-auto flex h-svh flex-col items-center justify-center">
	<a class="text-3xl font-black" href={resolve('/')}>SuperImpress</a>
	<slot></slot>
</div>
