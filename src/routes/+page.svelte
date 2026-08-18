<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { getCheckout } from '$lib/checkoutAccessor';
	import MailNoticeDialog from '$lib/MailNoticeDialog.svelte';

	let showModal = false;

	// ペット向けページへの導線。店舗コード（agencyCode）を引き継いで遷移する。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;

	const fixedPortalShopId = 'acct_1QhJkZPo9yD7PttV';
	let cancelMailAddress = '';
	let isCancelLoading = false;
	let cancelError = '';
	let showMailNotice = false;

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const mailAddress = params.get('mail_address');
		if (mailAddress) cancelMailAddress = mailAddress;

		// 解約ポータルから戻ってきたタイミングで、確認メール通知の案内ダイアログを出す。
		if (params.get('portal_return') === '1') {
			showMailNotice = true;
			const url = new URL(window.location.href);
			url.searchParams.delete('portal_return');
			window.history.replaceState({}, '', url.toString());
		}
	});

	const goToCancelPortal = async () => {
		cancelError = '';
		const mailAddress = cancelMailAddress.trim();
		if (!mailAddress) {
			cancelError = 'ご契約メールアドレスを入力してください。';
			return;
		}

		isCancelLoading = true;
		try {
			// 戻り URL に目印を付け、ポータルから戻った直後に確認メール通知の案内を出す。
			const returnUrl = new URL(window.location.href);
			returnUrl.searchParams.set('portal_return', '1');

			const url = await getCheckout<string>('/api/v1/subscription/portal-url', {
				params: {
					shopId: fixedPortalShopId,
					mail_address: mailAddress,
					return_url: returnUrl.toString()
				}
			});

			if (typeof url === 'string' && url.length > 0) {
				window.location.href = url;
				return;
			}
			throw new Error('invalid response');
		} catch (e) {
			console.error('解約ポータルの表示に失敗しました:', e);
			cancelError = '解約ページの表示に失敗しました。メールアドレスをご確認のうえ、再度お試しください。';
		} finally {
			isCancelLoading = false;
		}
	};
</script>

<div class="lp">

	<!-- ================= HERO ================= -->
	<div class="hero">
		<div class="hero-frame">
			<img class="hero-img" src={`${base}/images/hero/main.png`} alt="" />

			<!-- タイトルと受賞マーク。画面が低い端末では sticky でビューポート下端に
			     追従表示し、本来の位置（ヒーロー下部）に来たら止まる。 -->
			<div class="hero-caption">
				<h1 class="hero-title">エステの<br />ある暮らし。</h1>

				<!-- Instagram広告と同じサブコピー -->
				<p class="hero-subtitle">毎日が、ちょっと楽しくなる。</p>

				<div class="hero-awards">
					<img src={`${base}/images/awards/kyoto-univ.png`} alt="京都大学総長賞" />
					<img src={`${base}/images/awards/health20.png`} alt="health2.0受賞" />
				</div>
			</div>
		</div>
	</div>

	<!-- ================= ミスト振動 ================= -->
	<section class="mist">
		<img class="mist-bg" src={`${base}/images/mist/ripple.png`} alt="" aria-hidden="true" />
		<div class="mist-content">
			<h2 class="heading">
				霧のように細やかな<br />
				「ミスト振動」が、<br />
				肌の奥からハリを呼び覚ます。
			</h2>

			<p class="body-copy">
				手のひらでのマッサージは、<br />
				実は肌への摩擦になりがち。
			</p>
			<p class="body-copy">
				この美顔器が採用したのは、<br />
				まるで極上の霧を浴びているかのような<br />
				繊細な「ミスト振動」です。
			</p>
			<p class="body-copy">
				肌の奥を心地よく刺激することで、<br />
				お肌本来のコラーゲン生成を促します。
			</p>
		</div>
	</section>

	<!-- ================= コラーゲン ================= -->
	<section class="collagen">
		<h2 class="heading align-right">
			肌のたるみ、くすみに<br />
			素早くアプローチ
		</h2>

		<div class="collagen-images">
			<img src={`${base}/images/collagen/before.png`} alt="使用前のコラーゲン" />
			<img src={`${base}/images/collagen/after.png`} alt="使用後のコラーゲン" />
		</div>

		<p class="note align-right">
			緑、黄色の表示部分がコラーゲン(黄色:密度高)<br />
			皮膚の下に沈んでいたコラーゲンが<br />
			振動によって表皮に押し上げられ、<br />
			肌にハリをもたらします。
		</p>
	</section>

	<!-- ================= 使い方 ================= -->
	<section class="usage">
		<div class="usage-block">
			<h2 class="heading align-left">
				使い方は簡単、<br />
				顔に乗せるだけ。
			</h2>
			<p class="sub align-left">
				忙しい毎日でも続けられる。<br />
				10分間、心地よいセルフエステタイム
			</p>
			<img class="usage-img" src={`${base}/images/usage/face-mask.png`} alt="美顔器を顔に乗せる様子" />
		</div>

		<div class="usage-block">
			<h2 class="heading align-right">
				顔以外にも、<br />
				全身どこでも使えます。
			</h2>
			<p class="sub align-right">
				頭からつま先まで全身にお使いいただけます。<br />
				深く満たされる心地よいリラックスタイムを。
			</p>
			<img class="usage-img" src={`${base}/images/usage/body.png`} alt="振動器を身体に使う様子" />
		</div>

		<div class="usage-video">
			<div class="usage-video-frame">
				<iframe
					src="https://www.youtube.com/embed/irmZgfw1CzQ?si=ok31EkunFMwryn__"
					title="わたしのエステ 使い方動画"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
				></iframe>
			</div>
		</div>
	</section>

	<!-- ================= エステのサブスク ================= -->
	<section class="subsc">
		<img class="subsc-bg" src={`${base}/images/subscription/pond.png`} alt="" aria-hidden="true" />
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
			<p class="subsc-copy">
				合わなければ、いつでもご返却いただけます。<br />
				まずは１ヶ月、初めてみませんか？
			</p>

			<button class="cta" on:click={() => (showModal = true)}>お申しこみはこちら</button>
		</div>
	</section>

	<!-- ================= 付帯導線（ペット / 解約） ================= -->
	<section class="extras">
		<a href={petPageUrl} class="pet-link">
			🐾 ペットと一緒に使いたい方はこちら
			<span aria-hidden="true">→</span>
		</a>

		<div id="cancel-portal" class="cancel-card">
			<div class="cancel-eyebrow">ご契約中のお客さま</div>
			<h3 class="cancel-title">解約・お支払い情報の確認</h3>
			<p class="cancel-lead">ご契約メールアドレスを入力すると、専用ページへ移動します。</p>

			<label class="cancel-label">
				ご契約メールアドレス
				<input
					type="email"
					bind:value={cancelMailAddress}
					placeholder="user@example.com"
					class="cancel-input"
				/>
			</label>

			{#if cancelError}
				<p class="cancel-error">{cancelError}</p>
			{/if}

			<button class="cancel-button" on:click={goToCancelPortal} disabled={isCancelLoading}>
				{#if isCancelLoading}
					解約ページを準備中...
				{:else}
					解約ページへ進む
				{/if}
			</button>
		</div>
	</section>
</div>

{#if showModal}
	<ModalFlow on:close={() => (showModal = false)} />
{/if}

<MailNoticeDialog
	open={showMailNotice}
	title="解約手続きについて"
	message={'解約などのお手続きをいただいた場合は、haptico.co.jp より通知メールをお送りします。'}
	on:close={() => (showMailNotice = false)}
/>

<style>
	/* ===== デザイントークン =====
	   背景(明): #EDEFEE / 背景(暗): #415356 / 文字: #000000 / #FFFFFF
	   字体: ヒラギノ明朝Pro */
	.lp {
		--light: #edefee;
		--dark: #415356;
		font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'hiragino-mincho-pro',
			'Yu Mincho', serif;
		color: #000;
		background-color: var(--light);
	}

	/* 幅393px（デザイン基準）未満の端末では行が崩れないよう比例縮小する */
	.heading {
		font-size: min(22px, 5.4vw);
		font-weight: 400;
		line-height: 2;
		letter-spacing: 0.1em;
	}

	.align-right {
		text-align: right;
	}
	.align-left {
		text-align: left;
	}

	/* ===== HERO ===== */
	.hero {
		container-type: inline-size;
		/* 半透明ヘッダー（ロゴ行）の背面にヒーローを潜り込ませる */
		margin-top: calc(-1 * var(--header-h, 0px));
	}

	/* sticky をビューポート基準で効かせるため overflow は設定しない */
	.hero-frame {
		position: relative;
		aspect-ratio: 393 / 733;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.hero-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-caption {
		position: sticky;
		bottom: 0;
		z-index: 2;
		padding: 3cqw 5% 4cqw;
		text-align: left;
	}

	.hero-title {
		color: #fff;
		font-weight: 400;
		font-size: 40px;
		font-size: 10.7cqw;
		line-height: 1.5;
		letter-spacing: 0.06em;
	}

	.hero-subtitle {
		margin-top: 2.5cqw;
		color: #fff;
		font-size: 4.7cqw;
		letter-spacing: 0.14em;
	}

	.hero-awards {
		display: flex;
		align-items: center;
		gap: 10px;
		gap: 2.5cqw;
		margin-top: 14px;
		margin-top: 3.5cqw;
	}

	.hero-awards img {
		width: 76px;
		width: 19.5cqw;
		height: auto;
	}

	/* ===== ミスト振動 ===== */
	.mist {
		position: relative;
		overflow: hidden;
		background-color: var(--light);
		text-align: center;
	}

	.mist-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 78%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 78%, transparent 100%);
	}

	.mist-content {
		position: relative;
		z-index: 1;
		padding: 96px 28px 110px;
	}

	.body-copy {
		font-size: min(13.5px, 4.1vw);
		line-height: 2.4;
		letter-spacing: 0.08em;
		color: rgba(0, 0, 0, 0.65);
	}

	.mist-content .body-copy:first-of-type {
		margin-top: 170px;
	}

	.mist-content .body-copy + .body-copy {
		margin-top: 56px;
	}

	/* ===== コラーゲン ===== */
	.collagen {
		background-color: var(--light);
		padding: 40px 24px 110px;
	}

	.collagen-images {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-top: 48px;
	}

	.collagen-images img {
		width: 41%;
		height: auto;
	}

	.note {
		margin-top: 40px;
		font-size: min(12px, 3.3vw);
		line-height: 2.3;
		letter-spacing: 0.06em;
		color: rgba(0, 0, 0, 0.75);
	}

	/* ===== 使い方 ===== */
	.usage {
		background-color: var(--dark);
		color: #fff;
		padding: 100px 28px 110px;
	}

	.usage-block + .usage-block {
		margin-top: 150px;
	}

	.sub {
		margin-top: 26px;
		font-size: min(13px, 3.6vw);
		line-height: 2.2;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.85);
	}

	.usage-img {
		display: block;
		margin: 56px auto 0;
		width: 72%;
		height: auto;
	}

	.usage-video {
		margin-top: 130px;
		display: flex;
		justify-content: center;
	}

	.usage-video-frame {
		position: relative;
		width: 62%;
		max-width: 420px;
		aspect-ratio: 16 / 9;
	}

	.usage-video-frame iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* ===== エステのサブスク ===== */
	.subsc {
		position: relative;
		overflow: hidden;
		background-color: var(--light);
		text-align: center;
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
		padding: 100px 28px 110px;
	}

	.subsc-copy {
		font-size: min(14px, 3.65vw);
		line-height: 2.5;
		letter-spacing: 0.08em;
	}

	.subsc-content .subsc-copy:first-of-type {
		margin-top: 90px;
	}

	.subsc-content .subsc-copy + .subsc-copy {
		margin-top: 48px;
	}

	/* ボタン文字: #415356 / ボタン背景: #FFFFFF(透過度80%) */
	.cta {
		display: block;
		margin: 90px auto 0;
		width: 60%;
		max-width: 280px;
		padding: 15px 0;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.8);
		color: var(--dark);
		font-family: inherit;
		font-size: 15px;
		letter-spacing: 0.12em;
		transition: background-color 0.2s ease;
	}

	.cta:hover {
		background-color: rgba(255, 255, 255, 0.95);
	}

	/* ===== 付帯導線（デザイン外の機能ブロック） ===== */
	.extras {
		background-color: var(--light);
		padding: 72px 24px 40px;
	}

	.pet-link {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 0 auto;
		max-width: 480px;
		padding: 14px 20px;
		border: 1px solid rgba(65, 83, 86, 0.35);
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.8);
		color: var(--dark);
		font-size: 13px;
		letter-spacing: 0.06em;
		transition: background-color 0.2s ease;
	}

	.pet-link:hover {
		background-color: #fff;
	}

	.cancel-card {
		margin: 48px auto 0;
		max-width: 480px;
		padding: 24px 22px 26px;
		border: 1px solid rgba(65, 83, 86, 0.25);
		border-radius: 16px;
		background-color: rgba(255, 255, 255, 0.7);
		text-align: left;
	}

	.cancel-eyebrow {
		font-size: 11px;
		letter-spacing: 0.14em;
		color: rgba(65, 83, 86, 0.8);
	}

	.cancel-title {
		margin-top: 6px;
		font-size: 17px;
		letter-spacing: 0.06em;
		color: var(--dark);
	}

	.cancel-lead {
		margin-top: 10px;
		font-size: 13px;
		line-height: 2;
		color: rgba(0, 0, 0, 0.65);
	}

	.cancel-label {
		display: block;
		margin-top: 18px;
		font-size: 13px;
		color: var(--dark);
	}

	.cancel-input {
		margin-top: 8px;
		width: 100%;
		padding: 12px 16px;
		border: 1px solid rgba(65, 83, 86, 0.35);
		border-radius: 12px;
		background-color: #fff;
		font-size: 14px;
		color: #222;
	}

	.cancel-input:focus {
		outline: none;
		border-color: var(--dark);
		box-shadow: 0 0 0 2px rgba(65, 83, 86, 0.2);
	}

	.cancel-input::placeholder {
		color: rgba(65, 83, 86, 0.4);
	}

	.cancel-error {
		margin-top: 12px;
		font-size: 13px;
		color: #b3403c;
	}

	.cancel-button {
		margin-top: 18px;
		width: 100%;
		padding: 13px 20px;
		border-radius: 9999px;
		background-color: var(--dark);
		color: #fff;
		font-family: inherit;
		font-size: 14px;
		letter-spacing: 0.1em;
		transition: opacity 0.2s ease;
	}

	.cancel-button:hover {
		opacity: 0.9;
	}

	.cancel-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
