<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';

	import { initAgencyCode } from '$lib/agency/agencyCode';
	import { onMount } from 'svelte';

	onMount(() => {
		initAgencyCode();
	});
</script>

<!-- 下地色（任意） -->
<div class="fixed inset-0 -z-20" aria-hidden="true" />

<!-- “画面全体”に敷くブラー背景（切り抜きOK＝cover） -->
<img
	src={`${base}/images/my-main.png`}
	alt=""
	class="fixed inset-0 -z-20 w-screen h-[100dvh] object-cover object-center blur-lg brightness-90 select-none pointer-events-none"
/>

<!-- ここにページごとの中身を載せる -->
<div class="relative z-0 h-[100dvh] overflow-hidden">
	<slot />
</div>