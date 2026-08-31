<!-- src/routes/lp/+layout.svelte
     Instagram 流入用 LP のシェル。サイト本体 (site) のヘッダー・ペット導線・フッターは使わず、
     デザイン（addict/design_lp.png・393px 基準）どおりの1カラムに絞る。
     機能（店舗コード取り込み・申込モーダル・決済戻りダイアログ等）は親の +layout.svelte が担う。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import { agencyCode } from '$lib/agency/agencyCode';
</script>

<div class="lp-shell">
	<main class="lp-column">
		<slot />

		<footer class="lp-footer">
			<nav class="lp-footer__nav">
				<a href="{base}/terms_of_service">利用規約</a>
				<a href="{base}/privacy_policy">プライバシーポリシー</a>
				<a href="{base}/regal">特定商取引法に基づく表記</a>
			</nav>
			<p class="lp-footer__copy">{$agencyCode} | Facetherapie, Inc.</p>
		</footer>
	</main>
</div>

<style>
	.lp-shell {
		min-height: 100dvh;
		background-color: #edefee;
	}

	/* 393px 基準のデザインを崩さないよう、広い画面ではスマホ幅の1カラムに寄せる */
	.lp-column {
		max-width: 480px;
		margin: 0 auto;
		background-color: #fff;
		font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'hiragino-mincho-pro',
			'Yu Mincho', serif;
		color: #000;
	}

	@media (min-width: 481px) {
		.lp-column {
			box-shadow: 0 0 48px rgba(65, 83, 86, 0.12);
		}
	}

	.lp-footer {
		padding: 36px 24px 32px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		text-align: center;
	}

	.lp-footer__nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px 22px;
		font-size: 12px;
		letter-spacing: 0.06em;
		color: rgba(0, 0, 0, 0.6);
	}

	.lp-footer__nav a:hover {
		color: #000;
	}

	.lp-footer__copy {
		margin-top: 22px;
		font-size: 11px;
		letter-spacing: 0.06em;
		color: rgba(0, 0, 0, 0.4);
	}
</style>
