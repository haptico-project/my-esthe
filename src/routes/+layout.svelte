<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { initAgencyCode } from '$lib/agency/agencyCode';
	import { onMount } from 'svelte';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { initCoupon } from '$lib/coupon';

	// Stripe決済からの戻りを検知して、完了/キャンセルの案内を出す。
	// null=通常表示, 'success'=お申し込み完了, 'cancel'=未完了。
	let checkoutResult: 'success' | 'cancel' | null = null;

	onMount(() => {
		initAgencyCode();
		initCoupon();

		const params = new URL(window.location.href).searchParams;
		const result = params.get('checkout');
		if (result === 'success' || result === 'cancel') {
			checkoutResult = result;
			// 目印は消す（リロードでの再表示・URL汚染・SNS共有時の流出を防ぐ）。
			const url = new URL(window.location.href);
			url.searchParams.delete('checkout');
			window.history.replaceState({}, '', url.toString());
		}
	});

	const closeCheckoutResult = () => (checkoutResult = null);

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

{#if checkoutResult}
	<!-- 決済からの戻り後に必ず結果を提示し、「完了したか分からず再申込」を防ぐ -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] p-4 backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
	>
		<div class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 text-center shadow-[0_24px_60px_rgba(38,16,31,0.3)]">
			{#if checkoutResult === 'success'}
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbeef3]">
					<span class="text-3xl text-[#d45588]" aria-hidden="true">✓</span>
				</div>
				<h2 class="mt-5 text-2xl text-[#2e1d24]">お申し込みが完了しました</h2>
				<p class="mt-4 text-sm leading-7 text-[#5f4b53]">
					ご決済が完了し、お申し込みを受け付けました。<br />
					<span class="font-semibold text-[#c15582]">重ねてお申し込みいただく必要はございません。</span>
				</p>
				<button
					class="mt-6 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72]"
					on:click={closeCheckoutResult}
				>
					閉じる
				</button>
			{:else}
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3eef0]">
					<span class="text-3xl text-[#9a7d88]" aria-hidden="true">！</span>
				</div>
				<h2 class="mt-5 text-2xl text-[#2e1d24]">お申し込みは完了していません</h2>
				<p class="mt-4 text-sm leading-7 text-[#5f4b53]">
					決済が完了しませんでした。お手数ですが、もう一度お試しください。
				</p>
				<button
					class="mt-6 w-full rounded-full bg-[#26202a] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#171317]"
					on:click={closeCheckoutResult}
				>
					閉じる
				</button>
			{/if}
		</div>
	</div>
{/if}

