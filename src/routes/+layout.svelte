<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { initAgencyCode } from '$lib/agency/agencyCode';
	import { onMount } from 'svelte';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { initCoupon } from '$lib/coupon';
	import { initReferrer, referrerPromptOpen, saveReferrer, REFERRER_MAX_LENGTH } from '$lib/referrer';

	// Stripe決済からの戻りを検知して、完了/キャンセルの案内を出す。
	// null=通常表示, 'success'=お申し込み完了, 'cancel'=未完了。
	let checkoutResult: 'success' | 'cancel' | null = null;

	// 紹介者入力ポップアップの入力値。
	let referrerInput = '';
	const submitReferrer = () => saveReferrer(referrerInput);

	// モバイルでキーボード表示後に入力欄が隠れるため、見える位置までスクロールする。
	const scrollReferrerInputIntoView = (e: FocusEvent) => {
		const el = e.currentTarget as HTMLElement;
		// キーボードのせり上がりを待ってからスクロール。
		setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
	};

	onMount(() => {
		initAgencyCode();
		initCoupon();
		initReferrer();

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

	// ペット向けページへの導線（店舗コードを引き継ぐ）。固定ヘッダーに常時表示する。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;
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
			<header class="sticky top-0 z-20">
				<!-- ペット導線（固定・常時表示） -->
				<a
					href={petPageUrl}
					class="pet-bar group relative flex w-full items-center justify-center gap-2 overflow-hidden px-4 py-2.5 text-sm font-bold text-white sm:text-base"
				>
					<span class="pet-bar__label relative z-10 flex items-center gap-2">
						<span aria-hidden="true">🐾</span>
						ペットと一緒に使いたい方はこちら
						<span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
					</span>
					<span class="pet-bar__shine pointer-events-none absolute inset-0 z-0" aria-hidden="true"></span>
				</a>
				<div class="flex justify-between items-center w-full px-5 py-3" style="background-color: #FFFA;">
					<button on:click={() => window.location.href = '/'}>
						<img src="{`${base}/images/logo.png`}" alt="logo" class="max-w-[68px]" />
					</button>
					<div class="flex items-center gap-3">
						<a href="https://www.instagram.com/facetherapie" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="text-gray-600 hover:text-gray-900 transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/></svg></a>
						<a href="https://www.tiktok.com/@tftkabonj6g" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="text-gray-600 hover:text-gray-900 transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
						<button on:click={() => (showModal = true)}>
						<img src="{`${base}/images/request.png`}" alt="logo" class="max-w-[140px]" />
					</button>
					</div>
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

{#if $referrerPromptOpen}
	<!-- 紹介用URL(?ref)で来訪。紹介者を入力するまで閉じない（×・背景クリックでの閉じ不可）。 -->
	<!-- overflow-y-auto + min-h-full: モバイルでキーボード表示時に入力欄をスクロールで見られるようにする。 -->
	<div
		class="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
	>
		<div class="flex min-h-full items-center justify-center p-4">
		<div class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 text-center shadow-[0_24px_60px_rgba(38,16,31,0.3)]">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbeef3]">
				<span class="text-2xl text-[#d45588]" aria-hidden="true">🤝</span>
			</div>
			<h2 class="mt-5 text-xl text-[#2e1d24]">ご紹介者様のお名前</h2>
			<p class="mt-3 text-sm leading-7 text-[#5f4b53]">
				ご紹介いただいた方のお名前をご入力ください。
			</p>
			<input
				type="text"
				bind:value={referrerInput}
				maxlength={REFERRER_MAX_LENGTH}
				placeholder="例：山田 花子"
				on:keydown={(e) => e.key === 'Enter' && submitReferrer()}
				on:focus={scrollReferrerInputIntoView}
				class="mt-5 w-full rounded-xl border border-[#E6B9CE] bg-white px-4 py-3 text-center text-base text-[#4D2B3C] placeholder:text-[#BC9AAD] focus:border-[#D86A99] focus:outline-none focus:ring-2 focus:ring-[#F4B8D2]"
			/>
			<button
				class="mt-5 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72] disabled:cursor-not-allowed disabled:opacity-50"
				on:click={submitReferrer}
				disabled={!referrerInput.trim()}
			>
				確定して進む
			</button>
		</div>
		</div>
	</div>
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
				<p class="mt-4 rounded-xl bg-[#fbeef3] px-4 py-3 text-xs leading-6 text-[#8a5a72]">
					✉ <span class="font-semibold">haptico.co.jp</span> より、お申し込みに関する通知メールをお送りします。
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

<style>
	/* ペット導線ラベル（固定ヘッダー上部・フロストグラス＋みずみずしい光沢） */
	.pet-bar {
		background: linear-gradient(
			100deg,
			rgba(226, 100, 152, 0.66) 0%,
			rgba(234, 130, 178, 0.6) 55%,
			rgba(150, 209, 222, 0.54) 100%
		);
		backdrop-filter: blur(8px) saturate(1.25);
		-webkit-backdrop-filter: blur(8px) saturate(1.25);
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
	}
	.pet-bar__label {
		letter-spacing: 0.04em;
		text-shadow: 0 1px 1px rgba(105, 35, 75, 0.6), 0 1px 7px rgba(105, 35, 75, 0.45);
	}
	.pet-bar__shine {
		background: linear-gradient(
			115deg,
			transparent 0%,
			rgba(255, 255, 255, 0.55) 50%,
			transparent 100%
		);
		transform: translateX(-130%);
		animation: petShine 5s ease-in-out infinite;
	}
	@keyframes petShine {
		0% { transform: translateX(-130%); }
		28%, 100% { transform: translateX(130%); }
	}
	@media (prefers-reduced-motion: reduce) {
		.pet-bar__shine { animation: none; opacity: 0; }
	}
</style>

