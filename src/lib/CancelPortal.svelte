<!-- 解約・お支払い情報の確認カード。
     ご契約メールアドレスを入力すると Stripe のカスタマーポータル（payflow 経由）へ移動する。
     ポータルから戻った際（?portal_return=1）は、確認メールが届く旨のダイアログを出す。
     トップページと Instagram LP の両方で同じものを使う（申込モーダルの文言
     「ホームページ下部の『解約・お支払い情報の確認』」と対応）。
     色は --cancel-accent（既定 #415356）で差し替え可能。 -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getCheckout } from '$lib/checkoutAccessor';
	import MailNoticeDialog from '$lib/MailNoticeDialog.svelte';

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

<MailNoticeDialog
	open={showMailNotice}
	title="解約手続きについて"
	message={'解約などのお手続きをいただいた場合は、haptico.co.jp より通知メールをお送りします。'}
	on:close={() => (showMailNotice = false)}
/>

<style>
	.cancel-card {
		--accent: var(--cancel-accent, #415356);
		margin: 0 auto;
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
		font-weight: 400;
		letter-spacing: 0.06em;
		color: var(--accent);
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
		color: var(--accent);
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
		border-color: var(--accent);
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
		background-color: var(--accent);
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
