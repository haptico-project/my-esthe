<!-- フッター最下部の運営会社・所在地の帯。標準サイト (site) と Instagram LP (lp) の両方で使う。
     デザイン（Figma「無題」の LP 最下部・赤枠）：文字サイズ 見出し24 / 本文16、
     行送り 32（住所の2行目のみ 28）、公式サイトリンクは https://tokyo-ft.com -->
<div class="company-info">
	<p class="company-info__name">わたしのエステ</p>
	<p class="company-info__line">運営会社：株式会社ファセテラピー</p>
	<address class="company-info__address">
		〒112-0002 東京都文京区小石川2-3-4<br />第一川田ビル2階
	</address>
	<a class="company-info__link" href="https://tokyo-ft.com" target="_blank" rel="noopener">
		会社公式サイトはこちら
	</a>
</div>

<style>
	.company-info {
		padding: 32px 16px 40px;
		background-color: #415356;
		color: #fff;
		text-align: center;
		font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'hiragino-mincho-pro',
			'Yu Mincho', serif;
		font-size: 16px;
		line-height: 32px;
		letter-spacing: 0.04em;
	}

	.company-info__name {
		margin-bottom: 20px;
		font-size: 24px;
		line-height: 32px;
		letter-spacing: 0.08em;
	}

	.company-info__address {
		font-style: normal;
		line-height: 28px;
		padding: 2px 0;
	}

	.company-info__link {
		display: inline-block;
		color: #fff;
		transition: opacity 0.2s ease;
	}

	.company-info__link:hover {
		opacity: 0.7;
	}
</style>
