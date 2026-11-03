<!-- 公式LINE への案内カード。標準サイト (site) と Instagram LP (lp) の両方で、
     フッターのリンク帯と運営会社帯（CompanyInfoFooter）のあいだに置く。
     目的：公式LINE の登録者を増やす＋疑問・不安を気軽に相談できる窓口を見せる。
     デザイン（Figma「無題」LP 最下部・Rectangle 347）：
       文字サイズ 公式LINE 24 / でお気軽に〜 20 / QRで友達登録 12 / 本文 16、要素間 32
       色 ボタン #FF7C7C→#FF9696 のグラデーション、公式LINE #FF7C7C、背景 #FFE8E8
       角 背景 10 / ボタン 30 / QRコード 10
     リンク先は LIFF に店舗コード（agencyCode）を shopCode として付けたもの。
     QR はそのリンクをブラウザ側で生成する（外部の QR 生成サービスには送らない）。
     LINE アイコンは公式配布物（https://www.line.me/ja/logo の LINE_APP_iOS）をそのまま使う。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import QRCode from 'qrcode';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { track } from '$lib/analytics';

	const LIFF_URL = 'https://liff.line.me/2007233135-vxLAjokB';

	$: lineUrl = $agencyCode ? `${LIFF_URL}?shopCode=${encodeURIComponent($agencyCode)}` : LIFF_URL;

	// 中央に LINE アイコンを重ねるので、欠けても読める誤り訂正 H で作る。
	let qrSvg = '';
	$: QRCode.toString(lineUrl, { type: 'svg', errorCorrectionLevel: 'H', margin: 0 })
		.then((svg) => (qrSvg = svg))
		.catch(() => (qrSvg = ''));

	const onClick = () => track('line_click', { cta_location: 'footer' });
</script>

<section class="line-card" aria-label="公式LINEのご案内">
	<div class="line-card__inner">
		<p class="line-card__lead">
			<span class="line-card__body">ご不明点・お困りごとは</span>
			<span class="line-card__title"
				><span class="line-card__accent">公式LINE</span>でお気軽にご相談ください</span
			>
			<span class="line-card__body">専門スタッフが対応いたします</span>
		</p>

		<div class="line-card__row">
			<a class="line-card__btn" href={lineUrl} target="_blank" rel="noopener" on:click={onClick}>
				<img class="line-card__icon" src="{base}/images/sns/line.png" alt="LINE" />
				<span class="line-card__btn-text">
					<span class="line-card__btn-sub">QRで友達登録</span>
					<span class="line-card__btn-main">公式LINEはこちら</span>
				</span>
			</a>

			<div class="line-card__qr" role="img" aria-label="公式LINE 友だち登録用QRコード">
				{#if qrSvg}
					{@html qrSvg}
					<img class="line-card__qr-logo" src="{base}/images/sns/line.png" alt="" />
				{/if}
			</div>
		</div>

		<ul class="line-card__topics">
			<li>契約・解約の手続き</li>
			<li>交換・不具合のご相談</li>
			<li>その他お問い合わせ</li>
		</ul>
	</div>
</section>

<style>
	.line-card {
		padding: 12px 6px;
		background-color: #fff;
	}

	.line-card__inner {
		max-width: 368px;
		margin: 0 auto;
		padding: 24px 12px 20px;
		border-radius: 10px;
		background-color: #ffe8e8;
		color: #000;
		text-align: center;
		font-family:
			'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'hiragino-mincho-pro', 'Yu Mincho', serif;
		font-size: 16px;
		line-height: 32px;
		letter-spacing: 0.04em;
	}

	.line-card__lead > span {
		display: block;
	}

	.line-card__title {
		font-size: 20px;
		line-height: 32px;
		letter-spacing: 0;
		white-space: nowrap;
	}

	.line-card__accent {
		color: #ff7c7c;
		font-size: 24px;
	}

	.line-card__row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		margin-top: 28px;
	}

	.line-card__btn {
		display: flex;
		flex: 1 1 auto;
		min-width: 0;
		max-width: 236px;
		align-items: center;
		gap: 14px;
		padding: 10px 16px 10px 12px;
		border-radius: 30px;
		background-image: linear-gradient(90deg, #ff7c7c, #ff9696);
		box-shadow: 0 4px 8px rgba(255, 124, 124, 0.35);
		color: #fff;
		text-align: left;
		transition: opacity 0.2s ease;
	}

	.line-card__btn:hover {
		opacity: 0.85;
	}

	.line-card__icon {
		width: 56px;
		height: 56px;
		flex: none;
	}

	.line-card__btn-text {
		display: flex;
		flex-direction: column;
		line-height: 1.5;
	}

	.line-card__btn-sub {
		font-size: 12px;
		opacity: 0.9;
	}

	.line-card__btn-main {
		font-size: 16px;
		white-space: nowrap;
	}

	.line-card__qr {
		position: relative;
		flex: none;
		width: 92px;
		height: 92px;
		padding: 6px;
		border-radius: 10px;
		background-color: #fff;
	}

	.line-card__qr :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.line-card__qr-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 22px;
		height: 22px;
		transform: translate(-50%, -50%);
		border: 2px solid #fff;
		border-radius: 6px;
		background-color: #fff;
	}

	.line-card__topics {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 0 4px;
		margin-top: 24px;
		padding: 0;
		list-style: none;
		text-align: left;
		font-size: 16px;
		line-height: 32px;
		letter-spacing: 0;
	}

	.line-card__topics li::before {
		content: '✓';
		font-weight: bold;
	}
</style>
