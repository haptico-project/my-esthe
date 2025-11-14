<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { initAgencyCode } from '$lib/agency/agencyCode';
	import { onMount } from 'svelte';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import { agencyCode } from '$lib/agency/agencyCode';

	onMount(() => {
		initAgencyCode();
	});

	let showModal = false;
</script>

<div class="relative min-h-dvh font-sans text-ink">

	<!-- 背景（固定） -->
	<div
		class="fixed inset-0 -z-10 pointer-events-none bg-cover bg-center blur-md brightness-90"
		style={`background-image: url('${base}/images/bg.jpg');`}
	/>
	<div class="fixed inset-0 -z-10 bg-white/40 pointer-events-none" />

	<!-- コンテンツ -->
	<div
		class="
      /* ✅ モバイル: 幅制限なし・グリッドなし（＝フル幅） */
      /* ✅ PC: md以上でだけグリッド化＋最大幅制御 */
      md:mx-auto md:max-w-[1200px] md:px-6
      md:grid md:grid-cols-[1fr_min(100%,theme(maxWidth.phone))_1fr]
    "
	>
		<!-- 左右は md 未満で非表示 -->
		<aside class="hidden md:block"><slot name="left" /></aside>

		<!-- 中央。モバイルはフル幅、PCはスマホ幅に制限 -->
		<main class="w-full md:mx-auto md:max-w-phone">
			<header class="sticky top-0 z-10" style="background-color: #FFFA;">
				<div class="flex justify-between items-center w-full px-5 py-3">
					<button on:click={() => window.location.href = '/'}>
						<img src="{`${base}/images/logo.png`}" alt="logo" class="max-w-[68px]" />
					</button>
					<button on:click={() => (showModal = true)}>
						<img src="{`${base}/images/request.png`}" alt="logo" class="max-w-[140px]" />
					</button>
				</div>
			</header>

			<slot />


			<footer class="mt-40 pb-6 border-t border-gray-200">
				<div class="w-full px-5 py-6 text-sm text-gray-600 text-center">

					<!-- リンク集 -->
					<nav class="flex flex-col gap-8 mb-6">
						<a href="/terms_of_service" class="hover:text-gray-900 transition-colors">利用規約</a>
						<a href="/privacy_policy" class="hover:text-gray-900 transition-colors">プライバシーポリシー</a>
						<a href="/regal" class="hover:text-gray-900 transition-colors">特定商取引法に基づく表記</a>
						<!--				<a href="#" class="hover:text-gray-900 transition-colors">お問い合わせ</a>-->
					</nav>

					<!-- コピーライト -->
					<div class="text-xs text-gray-400 mt-12">
						{$agencyCode} | Facetherapie, Inc.
					</div>

				</div>
			</footer>
		</main>

		<aside class="hidden md:block"><slot name="right" /></aside>
	</div>
</div>

{#if showModal}
	<ModalFlow on:close={() => (showModal = false)} />
{/if}

