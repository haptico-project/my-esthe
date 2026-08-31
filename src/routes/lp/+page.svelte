<!-- src/routes/lp/+page.svelte … Instagram 流入用 LP
     デザイン: addict/design_lp.png（393px 基準・字体 ヒラギノ明朝Pro）
     素材:     static/images/lp/（受賞マーク・ロゴ・池の写真はトップと共用）
     申込はトップと同じ申込モーダル（$lib/applyModal）、解約はトップと同じ解約カード（$lib/CancelPortal）。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { openApplyModal } from '$lib/applyModal';
	import CancelPortal from '$lib/CancelPortal.svelte';

	// ヒーローの申込ボタンがスクロールで画面の上に消えたら、同じ訴求の固定ヘッダーを出す。
	// 初期表示で画面の下にある（まだ見ていない）ときは出さない。
	let heroCta: HTMLButtonElement;
	let stickyCtaVisible = false;
	let stickyCtaDuration = 250;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stickyCtaDuration = 0;

		const observer = new IntersectionObserver(([entry]) => {
			stickyCtaVisible = !entry.isIntersecting && entry.boundingClientRect.top < 0;
		});
		observer.observe(heroCta);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>わたしのエステ｜顔に載せるだけ、月々3,300円で自宅がエステになる</title>
	<meta
		name="description"
		content="エステティシャンの手技を振動にした美顔器「わたしのエステ」。月々3,300円のサブスクで、商品到着後7日間は無料でお試しいただけます。"
	/>
</svelte:head>

<div class="lp">
	<!-- ================= HERO ================= -->
	<section class="hero">
		<div class="hero-frame">
			<img class="hero-img" src={`${base}/images/lp/hero.png`} alt="" />
			<img class="hero-badge" src={`${base}/images/logo.png`} alt="わたしのエステ" />

			<div class="hero-caption">
				<h1 class="hero-title">
					顔に載せるだけ<br />
					月々<em>3,300</em>円で<br />
					自宅が<em>エステ</em>になる
				</h1>
				<div class="hero-awards">
					<img src={`${base}/images/awards/kyoto-univ.png`} alt="京都大学総長賞" />
					<img src={`${base}/images/awards/health20.png`} alt="health2.0受賞" />
				</div>
			</div>
		</div>

		<!-- ヒーロー下端にまたがる申込ボタン -->
		<button type="button" class="hero-cta" bind:this={heroCta} on:click={openApplyModal}>
			まずは<em>7日間無料</em>お試し
		</button>
	</section>

	<!-- ================= 使い方 ================= -->
	<section class="usage">
		<h2 class="heading">使い方は簡単、<br />顔に乗せるだけ。</h2>
		<ol class="usage-steps">
			<li>1.ご希望の方はフェイスパックをつける</li>
			<li>2.「私のエステ」を顔にのせる</li>
			<li>3.3〜10分、そのままリラックス</li>
		</ol>
		<div class="usage-video">
			<!-- playsinline=1: iPhone Safari でページ内再生させる。rel=0: 停止後の関連動画を自チャンネルに限定する。 -->
			<iframe
				src="https://www.youtube.com/embed/irmZgfw1CzQ?si=ok31EkunFMwryn__&playsinline=1&rel=0"
				title="わたしのエステ 使い方動画"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		</div>
	</section>

	<!-- ================= 導入事例 ================= -->
	<section class="clients">
		<h2 class="heading">
			<em>企業の福利厚生、介護施設</em>で<br />
			「わたしのエステ」を<br />
			ご活用いただいています。
		</h2>
		<div class="clients-photos">
			<figure>
				<img src={`${base}/images/lp/clients/kaga-electronics.png`} alt="加賀電子株式会社様の導入風景" loading="lazy" />
				<figcaption>加賀電子株式会社様</figcaption>
			</figure>
			<figure>
				<img src={`${base}/images/lp/clients/alsok-joylife.png`} alt="ALSOKジョイライフ様の導入風景" loading="lazy" />
				<figcaption>ALSOKジョイライフ様</figcaption>
			</figure>
		</div>
	</section>

	<!-- ================= 手技を振動に ================= -->
	<section class="technique">
		<h2 class="heading">エステティシャンの手技を<br />振動にしました。</h2>
		<img
			class="technique-img"
			src={`${base}/images/lp/technique/hand-to-vibration.png`}
			alt="エステティシャンの手技が振動の波形に変換されるイメージ"
			loading="lazy"
		/>
		<ol class="technique-flow">
			<li>エステティシャンの<br />手の動き・圧・リズム</li>
			<li>触覚の技術を解析</li>
			<li>振動として再現</li>
			<li>自宅でエステティシャンの手技を体感</li>
		</ol>
	</section>

	<!-- ================= セット内容 ================= -->
	<section class="sets">
		<h2 class="heading">セット内容</h2>

		<div class="set">
			<div class="set-head">
				<h3 class="set-name">基本セット</h3>
				<p class="set-price"><span>3,300</span><small>円/月</small></p>
			</div>
			<p class="set-desc">気になる部分に振動を当ててアプローチ</p>
			<img class="set-img" src={`${base}/images/lp/sets/basic.png`} alt="基本セットの振動器を頬にあてる様子" loading="lazy" />
		</div>

		<div class="set">
			<div class="set-head">
				<h3 class="set-name">顔マスク<br />付きセット</h3>
				<p class="set-price"><span>5,500</span><small>円/月</small></p>
			</div>
			<p class="set-desc">透明の顔マスク付き<br />お顔の集中ケアがしたい方に</p>
			<img class="set-img" src={`${base}/images/lp/sets/face-mask.png`} alt="顔マスク付きセットを装着した様子" loading="lazy" />
		</div>
	</section>

	<!-- ================= ご利用の流れ ================= -->
	<section class="flow">
		<h2 class="heading">ご利用の流れ</h2>
		<ol class="flow-steps">
			<li class="flow-step">
				<div class="flow-card">
					<span class="flow-num" aria-hidden="true">1</span>
					<div class="flow-text">
						<h3 class="flow-title">お申し込み</h3>
						<p class="flow-body">3〜5日でご自宅に商品をお届けします。</p>
					</div>
				</div>
			</li>
			<li class="flow-step">
				<div class="flow-card">
					<span class="flow-num" aria-hidden="true">2</span>
					<div class="flow-text">
						<h3 class="flow-title">到着後7日間の無料体験</h3>
						<p class="flow-body">ご自宅で毎日のセルフエステをお試しください。</p>
					</div>
				</div>
			</li>
			<li class="flow-step">
				<div class="flow-card">
					<span class="flow-num" aria-hidden="true">3</span>
					<div class="flow-text">
						<h3 class="flow-title">解約/継続</h3>
						<p class="flow-body">
							無料使用期間終了後も継続される場合は、そのままご利用いただけます。<br />
							ご利用を終了される場合は、<a href="#cancel-portal">解約手続き</a>のうえ商品をご返送ください。
						</p>
					</div>
				</div>
			</li>
		</ol>
	</section>

	<!-- ================= エステのサブスク ================= -->
	<section class="subsc">
		<img class="subsc-bg" src={`${base}/images/subscription/pond.png`} alt="" aria-hidden="true" loading="lazy" />
		<div class="subsc-content">
			<h2 class="heading">エステのサブスク</h2>

			<p class="subsc-copy">
				ミストのように繊細な振動は、<br />
				一つひとつ職人の手で調整された<br />
				装置から生まれます。
			</p>
			<p class="subsc-copy">
				高価な機器を、気軽に毎日の生活へ。<br />
				月3,300円のサブスクリプションで、<br />
				“感じる美容”を叶えます。
			</p>
			<p class="subsc-copy">まずは１週間、試してみませんか？</p>

			<button type="button" class="cta" on:click={openApplyModal}>お申しこみはこちら</button>
		</div>
	</section>

	<!-- ================= 解約（デザイン外・トップと同じ機能） ================= -->
	<section class="cancel">
		<CancelPortal />
	</section>

	<!-- ヒーローの申込ボタンが画面上に消えている間だけ出る固定ヘッダー（バナー全体が申込ボタン） -->
	{#if stickyCtaVisible}
		<button
			type="button"
			class="sticky-cta"
			transition:fly={{ y: -72, duration: stickyCtaDuration }}
			on:click={openApplyModal}
		>
			<img class="sticky-cta__logo" src={`${base}/images/logo.png`} alt="" />
			<span class="sticky-cta__label">まずは<em>7日間無料</em>お試し</span>
			<span class="sticky-cta__pill">お申込み</span>
		</button>
	{/if}
</div>

<style>
	/* ===== デザイントークン（addict/design_lp.png の指示） =====
	   ピンク: #FF7C7C / 淡ピンク: #FFC4C4 / ボタン・濃背景: #415356 / 淡背景: #EDEFEE
	   見出し 28px・行間 40px / 本文 16px・行間 28px（393px 基準） */
	.lp {
		--pink: #ff7c7c;
		--pink-soft: #ffc4c4;
		--dark: #415356;
		--light: #edefee;
		background-color: #fff;
		color: #000;
		text-align: center;
	}

	/* 幅393px 未満の端末では行が崩れないよう比例縮小する（デザインの見出しは字送りほぼ0）。
	   最長の「エステティシャンの手技を」(12文字) が 320px 幅でも 1 行に収まるサイズ */
	.heading {
		font-size: min(28px, 6.9vw);
		font-weight: 400;
		line-height: 1.43;
		letter-spacing: 0.02em;
	}

	.heading em {
		font-style: normal;
		color: var(--pink);
	}

	.usage-steps,
	.clients-photos figcaption,
	.technique-flow,
	.set-desc,
	.flow-body,
	.subsc-copy {
		font-size: min(16px, 4.1vw);
		line-height: 1.75;
		letter-spacing: 0.03em;
	}

	/* ===== HERO ===== */
	.hero {
		container-type: inline-size;
	}

	.hero-frame {
		position: relative;
		aspect-ratio: 393 / 657;
	}

	.hero-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* 右上のロゴバッジ（トップのヘッダーロゴと同じ画像） */
	.hero-badge {
		position: absolute;
		top: 4.6cqw;
		right: 4.7cqw;
		width: 15.5cqw;
		height: auto;
	}

	.hero-caption {
		position: absolute;
		right: 3.6cqw;
		bottom: 16cqw;
		text-align: right;
		color: #fff;
	}

	/* 見出し 35px（ピンク部分 45px）・行間 60px */
	.hero-title {
		font-size: 8.9cqw;
		font-weight: 400;
		line-height: 1.714;
		letter-spacing: 0.04em;
	}

	.hero-title em {
		font-style: normal;
		font-size: 1.286em;
		color: var(--pink-soft);
	}

	.hero-awards {
		display: flex;
		justify-content: flex-end;
		gap: 4cqw;
		margin-top: 1.5cqw;
	}

	.hero-awards img {
		height: 22.4cqw;
		width: auto;
	}

	/* 352×92px のピル。中心がヒーロー画像の下端に来るよう半分だけ引き上げる */
	.hero-cta {
		position: relative;
		z-index: 1;
		display: block;
		width: 89.6cqw;
		height: 23.4cqw;
		margin: -11.7cqw auto 0;
		border-radius: 9999px;
		background-color: var(--dark);
		color: #fff;
		font-family: inherit;
		font-size: 7.6cqw;
		letter-spacing: 0.03em;
		white-space: nowrap;
		box-shadow: 0 10px 24px rgba(65, 83, 86, 0.25);
		transition: opacity 0.2s ease;
	}

	.hero-cta:hover {
		opacity: 0.92;
	}

	.hero-cta em {
		font-style: normal;
		color: var(--pink-soft);
	}

	/* ===== 使い方 ===== */
	.usage {
		padding: 40px 20px 0;
	}

	.usage-steps {
		display: inline-block;
		margin-top: 13px;
		padding: 0;
		list-style: none;
		text-align: left;
	}

	/* スマホで小さすぎるとプレーヤー上部のチャンネル名帯を誤タップして
	   YouTube側へ遷移しやすいため、再生ボタンが十分大きくなる幅にする */
	.usage-video {
		position: relative;
		width: min(86%, 420px);
		aspect-ratio: 16 / 9;
		margin: 30px auto 0;
	}

	.usage-video iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* ===== 導入事例 ===== */
	/* 「企業の福利厚生、介護施設で」(13文字) を 1 行に収めるため、余白を詰めて字送り 0 にする */
	.clients {
		padding: 43px 16px 0;
	}

	.clients .heading {
		letter-spacing: 0;
	}

	/* デザイン: 写真 2 枚（各 164px）・左右余白 約 23px・間隔 17px（393px 基準） */
	.clients-photos {
		display: flex;
		justify-content: center;
		gap: 4.3%;
		margin-top: 47px;
		padding: 0 2%;
	}

	/* min-width: 0 … キャプション（nowrap）の幅で figure の幅が変わらないよう、2枚を必ず同じ幅にする */
	.clients-photos figure {
		flex: 1 1 0;
		min-width: 0;
		margin: 0;
	}

	.clients-photos img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* デザインではキャプション幅≒写真幅（16px・字送り0）。狭い端末では写真幅に合わせて縮める */
	.clients-photos figcaption {
		margin-top: 14px;
		font-size: min(16px, 4vw);
		letter-spacing: 0;
		white-space: nowrap;
	}

	/* ===== 手技を振動に ===== */
	.technique {
		margin-top: 33px;
		padding: 40px 20px 76px;
		background-color: var(--dark);
		color: #fff;
	}

	.technique-img {
		display: block;
		width: 88%;
		height: auto;
		margin: 30px auto 0;
	}

	.technique-flow {
		margin: 43px 0 0;
		padding: 0;
		list-style: none;
	}

	.technique-flow li + li::before {
		content: '↓';
		display: block;
		color: var(--pink-soft);
	}

	/* ===== セット内容 ===== */
	.sets {
		padding: 49px 20px 0;
	}

	/* 393px で幅 279px。狭い端末ではセット名と価格が折り返さないよう 280px を下限にする */
	.set {
		width: 71%;
		min-width: min(100%, 280px);
		max-width: 300px;
		margin: 15px auto 0;
	}

	.set + .set {
		margin-top: 42px;
	}

	.set-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 4px;
		border-bottom: 1px solid #000;
		text-align: left;
	}

	.set-name {
		font-size: min(24px, 6.1vw);
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.set-price {
		color: var(--pink);
		font-size: min(28px, 7.1vw);
		line-height: 1;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.set-price small {
		font-size: min(16px, 4.1vw);
	}

	/* デザイン実測（393px で 18 文字が幅 279px に収まる＝約 15.4px・字送りなし）に合わせる */
	.set-desc {
		margin-top: 8px;
		font-size: min(15.3px, 3.9vw);
		letter-spacing: 0;
	}

	.set-img {
		display: block;
		width: 100%;
		height: auto;
		margin-top: 10px;
	}

	/* ===== ご利用の流れ ===== */
	.flow {
		padding: 82px 22px 70px;
	}

	.flow-steps {
		margin: 27px 0 0;
		padding: 0;
		list-style: none;
	}

	/* カード間の灰色の下向き三角 */
	.flow-step + .flow-step::before {
		content: '';
		display: block;
		width: 44px;
		height: 18px;
		margin: 7px auto 6px;
		background-color: #d9d9d9;
		clip-path: polygon(0 0, 100% 0, 50% 100%);
	}

	.flow-card {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 14px 14px 12px;
		border: 1.5px solid var(--pink);
		border-radius: 22px;
		text-align: left;
	}

	.flow-num {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 33px;
		height: 33px;
		border-radius: 50%;
		background-color: var(--pink);
		color: #fff;
		font-size: 22px;
		line-height: 1;
	}

	.flow-text {
		flex: 1 1 0;
		min-width: 0;
	}

	/* 「到着後7日間の無料体験」が 360px 幅でも1行に収まるサイズ */
	.flow-title {
		font-size: min(24px, 6vw);
		font-weight: 400;
		line-height: 33px;
		letter-spacing: 0.02em;
		color: var(--pink);
	}

	.flow-body {
		margin-top: 4px;
	}

	.flow-body a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ===== エステのサブスク ===== */
	.subsc {
		position: relative;
		overflow: hidden;
		background-color: var(--light);
	}

	.subsc-bg {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: auto;
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 35%);
		mask-image: linear-gradient(to bottom, transparent 0%, #000 35%);
	}

	.subsc-content {
		position: relative;
		z-index: 1;
		padding: 76px 28px 115px;
	}

	.subsc-copy {
		margin-top: 52px;
	}

	.subsc-content .subsc-copy:first-of-type {
		margin-top: 45px;
	}

	/* ボタン文字: #415356 / ボタン背景: #FFFFFF(透過度80%) */
	.cta {
		display: block;
		width: 55%;
		max-width: 260px;
		margin: 92px auto 0;
		padding: 14px 0;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.8);
		color: var(--dark);
		font-family: inherit;
		font-size: min(18px, 4.6vw);
		letter-spacing: 0.1em;
		transition: background-color 0.2s ease;
	}

	.cta:hover {
		background-color: rgba(255, 255, 255, 0.95);
	}

	/* ===== 解約 ===== */
	.cancel {
		padding: 56px 24px 32px;
	}

	/* 「解約手続き」リンクで飛んだとき、固定ヘッダーの下に見出しが隠れないようにする */
	.cancel :global(#cancel-portal) {
		scroll-margin-top: 72px;
	}

	/* ===== 固定ヘッダー（申込バナー） =====
	   LP カラム（max-width 480px）と同じ幅で上端に固定。申込モーダル（z-20）より下に置く。 */
	.sticky-cta {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 10px 14px 10px 12px;
		padding-top: calc(10px + env(safe-area-inset-top, 0px));
		background-color: rgba(65, 83, 86, 0.96);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		color: #fff;
		font-family: inherit;
		box-shadow: 0 6px 20px rgba(65, 83, 86, 0.28);
		transition: opacity 0.2s ease;
	}

	.sticky-cta:hover {
		opacity: 0.94;
	}

	.sticky-cta__logo {
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
	}

	.sticky-cta__label {
		flex: 1 1 0;
		font-size: min(18px, 4.6vw);
		letter-spacing: 0.04em;
		white-space: nowrap;
		text-align: center;
	}

	.sticky-cta__label em {
		font-style: normal;
		color: var(--pink-soft);
	}

	.sticky-cta__pill {
		flex: none;
		padding: 8px 14px;
		border-radius: 9999px;
		background-color: var(--pink-soft);
		color: var(--dark);
		font-size: 12px;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}
</style>
