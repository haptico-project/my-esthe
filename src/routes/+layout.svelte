<!-- src/routes/+layout.svelte
     全ページ共通の「機能」シェル。見た目（ヘッダー・フッター・背景）は持たない。
       - (site)/+layout.svelte … サイト本体（トップ・規約類）の装飾
       - lp/+layout.svelte     … Instagram 流入用 LP の装飾
     ここでは URL から店舗コード・クーポン・紹介者を取り込み、
     全ページで共有するダイアログ類（申込モーダル / 決済戻り / 紹介者入力 / ペット違い）を
     1つずつ描画する。 -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAgencyCode } from '$lib/agency/agencyCode';
	import { initCoupon } from '$lib/coupon';
	import { initReferrer } from '$lib/referrer';
	import { applyModalOpen, closeApplyModal } from '$lib/applyModal';
	import { initAnalytics, trackPageView, track } from '$lib/analytics';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import PetDifferenceDialog from '$lib/PetDifferenceDialog.svelte';
	import ReferrerPromptDialog from '$lib/ReferrerPromptDialog.svelte';
	import CheckoutResultDialog from '$lib/CheckoutResultDialog.svelte';

	onMount(() => {
		initAgencyCode();
		initCoupon();
		initReferrer();
		initAnalytics();
	});

	// SvelteKit は画面遷移でスクリプトを読み直さないので、ページビューは遷移のたびに手動で送る。
	// 初回表示でも呼ばれるため、ここでも initAnalytics（多重呼び出しは無視される）を先に通し、
	// gtag の準備前にイベントを取りこぼさないようにする。
	afterNavigate(() => {
		initAnalytics();
		trackPageView($page.url);
	});

	// 申込モーダルが開いた回数（＝申込の入口に立った人）を漏斗の 1 段として計測する。
	$: if ($applyModalOpen) track('apply_modal_open');
</script>

<slot />

{#if $applyModalOpen}
	<ModalFlow on:close={closeApplyModal} />
{/if}

<PetDifferenceDialog />
<ReferrerPromptDialog />
<CheckoutResultDialog />
