<!-- src/routes/(site)/+layout.svelte
     サイト本体（トップ・規約類）の見た目シェル：背景・固定ヘッダー（ペット導線 / ロゴ / SNS / 申込ボタン）・フッター。
     機能（店舗コード取り込み・申込モーダル・決済戻り / 紹介者 / ペット違いの各ダイアログ）は
     親の src/routes/+layout.svelte が担う。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { openApplyModal } from '$lib/applyModal';
	import PetLeadPanel from '$lib/PetLeadPanel.svelte';
	import RelatedLinksFooter from '$lib/RelatedLinksFooter.svelte';

	// ヘッダー行（ロゴ・SNS・申込ボタン）の高さ。トップページがヒーローを
	// この分だけ引き上げ、半透明ヘッダーがヒーロー画像に重なるようにする。
	let headerRowHeight = 0;

	// ペット向けページへの導線（店舗コードを引き継ぐ）。固定ヘッダーに常時表示する。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;

	// ペット導線バーはリンク直行ではなく、まず説明パネルを開く（初見ユーザーに
	// 「人にもペットにも同じ振動器」を先に伝えてから遷移してもらう）。
	let petLeadOpen = false;
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
		<main class="w-full md:mx-auto md:max-w-phone" style="--header-h: {headerRowHeight}px">
			<header class="sticky top-0 z-20">
				<!-- ペット導線（固定・常時表示）。押すと説明パネルが開く -->
				<div class="relative">
					<button
						type="button"
						class="pet-bar group relative flex w-full items-center justify-center gap-2 overflow-hidden px-4 py-2.5 text-sm font-bold text-white sm:text-base"
						aria-expanded={petLeadOpen}
						on:click={() => (petLeadOpen = !petLeadOpen)}
					>
						<span class="pet-bar__label relative z-10 flex items-center gap-2">
							<span aria-hidden="true">🐾</span>
							ペットと一緒に使いたい方はこちら
							<span
								aria-hidden="true"
								class="transition-transform duration-300 {petLeadOpen ? 'rotate-180' : ''}"
							>▾</span>
						</span>
						<span class="pet-bar__shine pointer-events-none absolute inset-0 z-0" aria-hidden="true"></span>
					</button>
					{#if petLeadOpen}
						<!-- パネル外タップで閉じる透明レイヤー（申込ボタン等がパネルに隠れたままになるのを防ぐ） -->
						<button
							type="button"
							tabindex="-1"
							aria-hidden="true"
							class="fixed inset-0 z-0 cursor-default"
							on:click={() => (petLeadOpen = false)}
						></button>
						<!-- ドロップダウン表示（ヘッダー高さを変えず、ヒーローの上に重ねる） -->
						<div class="absolute left-0 right-0 top-full z-10 px-3 pt-2">
							<PetLeadPanel {petPageUrl} />
						</div>
					{/if}
				</div>
				<div
					bind:clientHeight={headerRowHeight}
					class="flex justify-between items-center w-full px-5 py-3"
					style="background-color: rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);"
				>
					<button on:click={() => window.location.href = '/'}>
						<img src="{`${base}/images/logo.png`}" alt="logo" class="max-w-[68px]" />
					</button>
					<div class="flex items-center gap-3">
						<!-- Instagram: 公式ブランドキットのロゴ（Instagram_Glyph_Gradient。元データは images/ に保管） -->
						<a href="https://www.instagram.com/facetherapie" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="transition-opacity hover:opacity-80"><img src={`${base}/images/sns/instagram.png`} alt="" class="w-6 h-6" /></a>
						<!-- 申込ボタン。旧 request.png（ピンクのピル #ffadd0・白の明朝）をHTML化し、
						     「商品到着後7日間無料」を常時見える位置（固定ヘッダー）で訴求する。 -->
						<button class="apply-btn" on:click={openApplyModal}>
							到着後7日間無料お試し
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

					<!-- 関連リンク（グループサイト） -->
					<RelatedLinksFooter />

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

<style>
	/* 申込ボタン（旧 request.png 画像と同じピンクのピル＋白の明朝） */
	.apply-btn {
		padding: 12px 18px;
		border-radius: 9999px;
		background-color: #ffadd0;
		color: #fff;
		font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
		font-size: 13.5px;
		letter-spacing: 0.05em;
		line-height: 1;
		white-space: nowrap;
		transition: opacity 0.2s ease;
	}

	.apply-btn:hover {
		opacity: 0.85;
	}

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

