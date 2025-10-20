<!-- src/routes/agency/[id]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		const id = $page.params.id;
		goto(`/?agencyCode=${encodeURIComponent(id)}`);
	});
</script>

<p>リダイレクト中...</p>
