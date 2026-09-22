<!-- src/infras/ModalFlow.svelte … 申込モーダル（トップ / LP 共通）
     デザイン: addict/design_lp.png の「モーダル」フレーム（393px 基準・字体 ヒラギノ明朝Pro）

     LP の計測で「モーダルまで来た6人が全員そこで離脱」していたため、2026-09 に
     ①説明＋プラン選択 → ②内容確認 → ③規約同意 の3ステップをやめ、1画面に畳んだ。
     プラン内容・同梱品の説明は LP 本体（/lp の「選べる2つのプラン」）へ移している。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { coupon, clearCoupon } from '$lib/coupon';
	import PetLeadPanel from '$lib/PetLeadPanel.svelte';
	import { referrer } from '$lib/referrer';
	import { postCheckout } from '$lib/checkoutAccessor';
	import { track, rememberCheckout } from '$lib/analytics';

	type CheckoutProduct = {
		productId: string;
		quantity: number;
	};

	type Plan = {
		id: string;
		name: string;
		/** カードに出す一言（何を基準に選ぶかを伝える） */
		lead: string;
		price: number;
		img: string;
		imageAlt: string;
		orderProducts: CheckoutProduct[];
		/** 価格の下に出す注記 */
		notes: string[];
		/** 顔マスク代の支払い月数（支払い完了後は ongoingPrice に下がる） */
		commitmentMonths?: number;
		/** 支払い完了後の月額（commitmentMonths 経過後） */
		ongoingPrice?: number;
	};

	type PlanOption = {
		id: string;
		name: string;
		badge: string;
		description: string;
		amount: number;
		checkoutPriceId: string;
		images: { src: string; alt: string }[];
	};

	const dispatch = createEventDispatcher();

	const plans: Plan[] = [
		{
			id: 'face-mask-plan',
			name: '顔マスク付プラン',
			lead: '顔に載せるだけで、気軽にセルフエステを楽しみたい方へ。',
			price: 5500,
			img: `${base}/images/plans/face-mask.png`,
			imageAlt: '顔マスク付プランの顔マスク',
			orderProducts: [
				{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 },
				{ productId: 'price_1T94CTPo9yD7PttVbiyOrzT2', quantity: 1 }
			],
			notes: ['12ヶ月後、顔マスクはお客様のものに。', '13ヶ月目以降は月額3,300円（税込）'],
			commitmentMonths: 12,
			ongoingPrice: 3300
		},
		{
			id: 'standard-plan',
			name: '通常プラン',
			lead: '手に持って、顔や身体の気になるところにお使いいただけるシンプルなプランです。',
			price: 3300,
			img: `${base}/images/plans/standard.png`,
			imageAlt: '通常プランの振動器',
			orderProducts: [{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 }],
			notes: []
		}
	];

	const batteryOption: PlanOption = {
		id: 'mobile-battery',
		name: 'モバイルバッテリー',
		badge: '買い切り',
		description: '外出先でも使いやすいモバイルバッテリーを追加できます。',
		amount: 3300,
		checkoutPriceId: 'price_1T94LZPo9yD7PttVjccfOWqk',
		images: [
			{ src: `${base}/images/plans/option/battery.png`, alt: 'モバイルバッテリー本体' },
			{ src: `${base}/images/plans/option/battery-cable.png`, alt: '付属の充電コード' }
		]
	};

	const options: PlanOption[] = [batteryOption];

	// 顔マスク付プランは、12回で顔マスクを終了させる payflow 側のスケジュール登録が
	// 本番反映済みのため公開する。問題時は false に戻せば即時に非表示へ戻せる。
	const SHOW_FACE_MASK_PLAN = true;
	const visiblePlans = plans.filter((plan) => SHOW_FACE_MASK_PLAN || plan.id !== 'face-mask-plan');

	// 最初から1つ選んでおく（選ばないと進めない画面にしない）。デザインどおり左＝顔マスク付プラン。
	let selectedPlanId = visiblePlans[0].id;
	let selectedOptions: Record<string, boolean> = {};
	// 規約同意は必須のまま。3ステップ時代の全文表示はやめ、リンク＋小さなチェックに畳んでいる。
	let agreed = false;
	let isProcessing = false;

	$: selectedPlan = visiblePlans.find((plan) => plan.id === selectedPlanId) ?? visiblePlans[0];

	const choosePlan = (plan: Plan) => {
		if (plan.id === selectedPlanId) return;
		selectedPlanId = plan.id;
		// 漏斗の「プラン選択」段。どちらのプランで離脱しているかも見られるようにする。
		track('select_plan', {
			plan_id: plan.id,
			plan_name: plan.name,
			value: plan.price,
			currency: 'JPY'
		});
	};

	const toggleOption = (optionId: string) => {
		selectedOptions[optionId] = !selectedOptions[optionId];
	};

	// 閉じられた時点の選択内容を残す。「どこで申込をやめたか」を見るための計測。
	const close = () => {
		track('apply_modal_close', { step: 1, plan_id: selectedPlanId });
		dispatch('close');
	};

	// キャンペーンクーポン（特定URL ?coupon=）適用時、顔マスク付プランの顔マスク代(2,200円)が
	// 毎月割引される＝実質ずっと月3,300円。Stripeクーポンは顔マスク商品限定なので通常プランには効かない。
	const CAMPAIGN_PLAN_ID = 'face-mask-plan';
	const CAMPAIGN_MONTHLY_DISCOUNT = 2200;
	// クーポンの有効性（バックエンドで判定）。null=未確認/判定中, true=有効, false=無効。
	let couponValid: boolean | null = null;
	const campaignDiscount = (plan: Plan) =>
		$coupon && couponValid === true && plan.id === CAMPAIGN_PLAN_ID ? CAMPAIGN_MONTHLY_DISCOUNT : 0;

	// クーポンが指定されていれば、バックエンドで有効性を事前判定する（割引表示の前提）。
	let couponChecked = false;
	$: if ($coupon && !couponChecked) {
		couponChecked = true;
		void checkCoupon($coupon);
	}
	const checkCoupon = async (code: string) => {
		try {
			const campaignPlan = plans.find((plan) => plan.id === CAMPAIGN_PLAN_ID);
			const res = await postCheckout<
				{ couponId: string; orderProducts: CheckoutProduct[] },
				{ valid: boolean; reason: string }
			>('/api/v1/checkout/coupon-validate', {
				couponId: code,
				orderProducts: campaignPlan?.orderProducts ?? []
			});
			if (res && res.valid) {
				couponValid = true;
			} else {
				// 無効と確定 → 割引を出さず、保管場所からも破棄する。
				couponValid = false;
				clearCoupon();
			}
		} catch (e) {
			// 判定不能（ネットワーク等）は割引を出さない（安全側）。クーポンは破棄しない。
			couponValid = null;
		}
	};

	// ペット向けページへの導線（店舗コードを引き継ぐ）。リンク直行ではなく、まず説明パネルを開く。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;
	let petLeadOpen = false;

	const goToCheckout = async () => {
		// 二重申込防止：処理中の再クリックは無視する（決済ページ遷移までの数秒の連打対策）。
		if (isProcessing) return;

		const currentPlan = selectedPlan;
		const code = get(agencyCode);
		const couponId = get(coupon);
		const referredBy = get(referrer);

		if (!agreed) {
			alert('利用規約に同意のうえ、お進みください。');
			return;
		}

		if (!code || !currentPlan) {
			alert('代理店コードまたは選択プランが未設定です。');
			return;
		}

		isProcessing = true;

		// 漏斗の最終段。決済ページへ送り出したことと、その内訳を記録する。
		// 金額は戻り時の purchase にも使うため rememberCheckout で控えておく。
		track('begin_checkout', {
			plan_id: currentPlan.id,
			plan_name: currentPlan.name,
			value: currentPlan.price,
			currency: 'JPY',
			has_coupon: Boolean(couponId)
		});
		rememberCheckout({
			planId: currentPlan.id,
			planName: currentPlan.name,
			value: currentPlan.price
		});

		const currentUrl = get(page).url;
		const baseUrl = `${window.location.origin}${currentUrl.pathname}${currentUrl.search}`;
		// 決済完了 / キャンセルの戻り先に目印を付ける。戻ったフロント(+layout)はこれを見て
		// 「お申し込みが完了しました」の完了画面を表示し、重複申込を防ぐ。
		const successUrl = new URL(baseUrl);
		successUrl.searchParams.set('checkout', 'success');
		// 戻りURLには紹介フラグ ?ref を残さない（完了/キャンセル後に入力ポップアップを再表示させない）。
		successUrl.searchParams.delete('ref');
		const cancelUrl = new URL(baseUrl);
		cancelUrl.searchParams.set('checkout', 'cancel');
		cancelUrl.searchParams.delete('ref');
		const oneTimePriceIds = options
			.filter((option) => selectedOptions[option.id])
			.map((option) => option.checkoutPriceId);

		try {
			const res = await postCheckout('/api/v1/checkout/subscription-url', {
				checkoutSuccessUrl: successUrl.toString(),
				checkoutCancelUrl: cancelUrl.toString(),
				agencyCode: code,
				orderProducts: currentPlan.orderProducts,
				oneTimePriceIds,
				// クーポンは顔マスク付プランにのみ渡す。FACEMASK3300 は全体割引(applies_to無)のため、
				// 通常プランに渡すと 3,300→1,100 と誤割引になる。対象プラン限定で防ぐ。
				...(couponId && currentPlan.id === CAMPAIGN_PLAN_ID ? { couponId } : {}),
				// 紹介者（?ref で入力済みの場合）。Stripe metadata referred_by として保持される。
				...(referredBy ? { referredBy } : {})
			});

			if (res) {
				window.location.href = res as string;
				return;
			}
			alert('リダイレクト先が取得できませんでした。');
		} catch (err: any) {
			console.error(err);
			if (err?.code === 'INVALID_COUPON') {
				// 無効クーポンは保管場所から破棄し、割引表示も解除。通常価格で再度お試しいただく。
				clearCoupon();
				couponValid = false;
				alert('クーポンが無効なため、割引を解除しました。通常価格でもう一度お試しください。');
			} else {
				alert('決済処理中にエラーが発生しました。');
			}
		} finally {
			isProcessing = false;
		}
	};
</script>

<div class="apply-overlay">
	<div class="apply-modal" role="dialog" aria-modal="true" aria-label="お申し込み">
		<div class="apply-head">
			<h2 class="apply-title">お申し込み</h2>
			<button type="button" class="apply-close" on:click={close}>閉じる</button>
		</div>

		<!-- 「すぐ課金されるのでは」「簡単にやめられるのか」を申込み前に解消する（鈴木さん要望・2026-08） -->
		<div class="trial">
			<p class="trial-lead">
				<em class="trial-lead__from">商品到着後</em><em class="trial-lead__days">7日間無料</em
				>でお試しいただけます。
			</p>
			<p class="trial-note">
				無料期間中にご解約いただいた場合、月額料金はかかりません。<br />
				※商品のご返送時の送料のみ、お客さまご負担となります。
			</p>
		</div>

		<h3 class="apply-section">プランを選ぶ</h3>
		<div class="plans" class:plans--single={visiblePlans.length === 1}>
			{#each visiblePlans as plan (plan.id)}
				{@const discount = campaignDiscount(plan)}
				<label class="plan-card" class:plan-card--on={plan.id === selectedPlanId}>
					<span class="plan-head">
						<input
							class="plan-radio"
							type="radio"
							name="apply-plan"
							value={plan.id}
							checked={plan.id === selectedPlanId}
							on:change={() => choosePlan(plan)}
						/>
						<span class="plan-mark" aria-hidden="true"></span>
						<span class="plan-name">{plan.name}</span>
					</span>

					<span class="plan-body">
						<span class="plan-lead">{plan.lead}</span>
						<img class="plan-img" src={plan.img} alt={plan.imageAlt} />
					</span>

					<span class="plan-price">
						{#if discount > 0}
							<s class="plan-price__was">{plan.price.toLocaleString()}円</s>
						{/if}
						<em class="plan-price__unit">月額</em><em class="plan-price__value"
							>{(plan.price - discount).toLocaleString()}</em
						><em class="plan-price__unit">円</em><em class="plan-price__tax">（税込）</em>
					</span>

					{#if discount > 0}
						<span class="plan-note">キャンペーン適用中。ご契約中はずっとこの月額です。</span>
					{:else if plan.notes.length > 0}
						<span class="plan-note">
							{#each plan.notes as note (note)}{note}<br />{/each}
						</span>
					{/if}
				</label>
			{/each}
		</div>

		{#if couponValid === false}
			<p class="apply-alert">無効なクーポンコードが指定されました。通常価格でのご案内となります。</p>
		{/if}

		<h3 class="apply-section">オプションを選ぶ <small>(任意)</small></h3>
		{#each options as option (option.id)}
			<label class="opt-card">
				<span class="opt-head">
					<input
						class="plan-radio"
						type="checkbox"
						checked={selectedOptions[option.id]}
						on:change={() => toggleOption(option.id)}
					/>
					<span class="plan-mark" aria-hidden="true"></span>
					<span class="opt-name">{option.name}</span>
					<span class="opt-badge">{option.badge}</span>
					<span class="opt-price">
						<em class="opt-price__sign">＋</em><em class="opt-price__value"
							>{option.amount.toLocaleString()}</em
						><em class="opt-price__sign">円</em><em class="opt-price__tax">（税込）</em>
					</span>
				</span>
				<span class="opt-body">
					<span class="opt-desc">{option.description}</span>
					<span class="opt-images">
						{#each option.images as image (image.src)}
							<img src={image.src} alt={image.alt} />
						{/each}
					</span>
				</span>
			</label>
		{/each}

		<label class="agree">
			<input class="plan-radio" type="checkbox" bind:checked={agreed} />
			<span class="agree-mark" aria-hidden="true"></span>
			<span>
				<a href="{base}/terms_of_service" target="_blank" rel="noopener">利用規約</a>に同意します
			</span>
		</label>

		<button
			type="button"
			class="apply-submit"
			on:click={goToCheckout}
			disabled={!agreed || isProcessing}
		>
			{isProcessing ? '処理中...' : '7日間無料体験を始める'}
		</button>
		<p class="apply-caption">次のページで、お客様情報・お支払い方法の入力に進みます。</p>

		<div class="apply-links">
			<button type="button" aria-expanded={petLeadOpen} on:click={() => (petLeadOpen = !petLeadOpen)}>
				🐾 ペットと一緒に使いたい方はこちら
			</button>
		</div>
		{#if petLeadOpen}
			<div class="apply-pet"><PetLeadPanel {petPageUrl} /></div>
		{/if}
	</div>

	{#if isProcessing}
		<!-- 決済セッション生成〜遷移までの待ち時間に、処理中であることを明示し再クリックを物理的に塞ぐ -->
		<div class="apply-processing">
			<div class="apply-processing__box">
				<span class="apply-processing__spinner" aria-hidden="true"></span>
				<p>決済ページへ移動しています。<br />そのままお待ちください…</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ===== デザイントークン（addict/design_lp.png のモーダル指示） =====
	   ピンク: #FF7C7C / 淡ピンク背景・枠: #FFEEEE / ボタン: #332932
	   文字サイズ 見出し16・プラン名12・値段24・本文8（カード幅 368px 基準）

	   --u は「デザイン上の 1px」。368px が入らない端末（iPhone 12〜15 の 390px など）では
	   折り返して縦に伸びてしまうため、画面幅に比例して全体を縮める。 */
	.apply-overlay {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		background: radial-gradient(circle at top, rgba(255, 205, 224, 0.42), rgba(19, 12, 18, 0.88));
		backdrop-filter: blur(2px);
		font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'hiragino-mincho-pro', 'Yu Mincho',
			serif;
		color: #000;
	}

	.apply-modal {
		--u: min(1px, calc((100vw - 24px) / 368));
		width: 100%;
		max-width: 368px;
		max-height: 92vh;
		overflow-y: auto;
		padding: calc(15 * var(--u)) calc(16 * var(--u)) calc(18 * var(--u));
		border-radius: 16px;
		background-color: #fff;
		box-shadow: 0 24px 60px rgba(38, 16, 31, 0.22);
		text-align: left;
	}

	.apply-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: calc(12 * var(--u));
		padding-bottom: calc(4 * var(--u));
		border-bottom: 1px solid #a7a7a7;
	}

	.apply-title {
		font-size: calc(16 * var(--u));
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: 0.02em;
	}

	.apply-close {
		flex: none;
		font-family: inherit;
		font-size: calc(10 * var(--u));
		letter-spacing: 0.04em;
		color: #7a626c;
	}

	.apply-close:hover {
		color: #000;
	}

	/* ===== 7日間無料 ===== */
	.trial {
		margin-top: calc(16 * var(--u));
		padding: calc(10 * var(--u)) calc(4 * var(--u)) calc(14 * var(--u));
		border-radius: calc(10 * var(--u));
		background-color: #ffeeee;
		text-align: center;
	}

	.trial-lead {
		font-size: calc(12 * var(--u));
		line-height: 1.5;
	}

	.trial-lead em {
		font-style: normal;
		color: #ff7c7c;
	}

	.trial-lead__from {
		font-size: calc(16 * var(--u));
	}

	.trial-lead__days {
		font-size: calc(24 * var(--u));
	}

	.trial-note {
		margin-top: calc(7 * var(--u));
		font-size: calc(8 * var(--u));
		line-height: 1.5;
	}

	/* ===== 見出し ===== */
	.apply-section {
		margin-top: calc(16 * var(--u));
		font-size: calc(16 * var(--u));
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: 0.02em;
	}

	.apply-section small {
		font-size: calc(12 * var(--u));
	}

	.apply-alert {
		margin-top: calc(8 * var(--u));
		font-size: calc(9 * var(--u));
		line-height: 1.6;
		color: #c0395f;
	}

	/* ===== プラン ===== */
	.plans {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: calc(5 * var(--u));
		margin-top: calc(11 * var(--u));
	}

	.plans--single {
		grid-template-columns: 1fr;
	}

	.plan-card {
		display: block;
		padding: calc(9 * var(--u)) calc(9 * var(--u)) calc(13 * var(--u));
		border: 1px solid #ffeeee;
		border-radius: calc(10 * var(--u));
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	.plan-card--on {
		border-color: #ff7c7c;
	}

	.plan-head {
		position: relative;
		display: flex;
		align-items: center;
		gap: calc(7 * var(--u));
	}

	/* ラジオ／チェックボックスは見た目を .plan-mark に任せ、操作と読み上げだけ本体に残す */
	.plan-radio {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.plan-mark {
		flex: none;
		width: calc(17 * var(--u));
		height: calc(17 * var(--u));
		border: 1px solid #ff7c7c;
		border-radius: 50%;
	}

	.plan-radio:checked + .plan-mark {
		background-color: #ff7c7c;
	}

	.plan-radio:focus-visible + .plan-mark {
		outline: 2px solid #ff7c7c;
		outline-offset: 2px;
	}

	.plan-name {
		font-size: calc(12 * var(--u));
		letter-spacing: 0.02em;
	}

	.plan-body {
		display: flex;
		align-items: center;
		gap: calc(2 * var(--u));
		margin-top: calc(7 * var(--u));
	}

	.plan-lead {
		flex: 1 1 auto;
		font-size: calc(8 * var(--u));
		line-height: 1.5;
	}

	.plan-img {
		flex: none;
		height: calc(61 * var(--u));
		width: auto;
	}

	.plan-price {
		display: block;
		margin-top: calc(7 * var(--u));
		color: #ff7c7c;
		line-height: 1;
		white-space: nowrap;
	}

	.plan-price em {
		font-style: normal;
	}

	/* キャンペーン適用時の元値。値段の行に並べるとカード幅に入らないので上に置く */
	.plan-price__was {
		display: block;
		font-size: calc(10 * var(--u));
		color: #b8a3ac;
	}

	.plan-price__unit {
		font-size: calc(12 * var(--u));
	}

	.plan-price__value {
		margin-left: calc(2 * var(--u));
		font-size: calc(24 * var(--u));
	}

	.plan-price__tax {
		margin-left: calc(2 * var(--u));
		font-size: calc(10 * var(--u));
	}

	.plan-note {
		display: block;
		margin-top: calc(4 * var(--u));
		font-size: calc(8 * var(--u));
		line-height: 1.5;
	}

	/* ===== オプション ===== */
	.opt-card {
		display: block;
		margin-top: calc(14 * var(--u));
		padding: calc(9 * var(--u)) calc(11 * var(--u)) calc(13 * var(--u));
		border: 1px solid #ffeeee;
		border-radius: calc(10 * var(--u));
		cursor: pointer;
	}

	.opt-head {
		position: relative;
		display: flex;
		align-items: center;
		gap: calc(7 * var(--u));
	}

	.opt-name {
		font-size: calc(12 * var(--u));
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.opt-badge {
		flex: none;
		padding: calc(3 * var(--u)) calc(7 * var(--u));
		border-radius: 9999px;
		background-color: #ffeeee;
		font-size: calc(8 * var(--u));
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.opt-price {
		margin-left: auto;
		color: #ff7c7c;
		line-height: 1;
		white-space: nowrap;
	}

	.opt-price em {
		font-style: normal;
	}

	.opt-price__sign {
		font-size: calc(10 * var(--u));
	}

	.opt-price__value {
		margin: 0 calc(1 * var(--u)) 0 calc(2 * var(--u));
		font-size: calc(20 * var(--u));
	}

	.opt-price__tax {
		margin-left: calc(2 * var(--u));
		font-size: calc(8 * var(--u));
	}

	.opt-body {
		display: flex;
		align-items: flex-start;
		gap: calc(8 * var(--u));
		margin-top: calc(6 * var(--u));
	}

	.opt-desc {
		flex: 1 1 auto;
		font-size: calc(8 * var(--u));
		line-height: 1.5;
	}

	.opt-images {
		flex: none;
		display: flex;
		align-items: flex-end;
		gap: calc(6 * var(--u));
	}

	.opt-images img {
		height: calc(45 * var(--u));
		width: auto;
	}

	/* ===== 規約同意 =====
	   デザインには無いが同意取得は必須。ボタン直前に小さな1行として置く。 */
	.agree {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: calc(6 * var(--u));
		margin-top: calc(13 * var(--u));
		font-size: calc(10 * var(--u));
		cursor: pointer;
	}

	.agree-mark {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(13 * var(--u));
		height: calc(13 * var(--u));
		border: 1px solid #ff7c7c;
		border-radius: calc(3 * var(--u));
		color: #fff;
		font-size: calc(9 * var(--u));
		line-height: 1;
	}

	.plan-radio:checked + .agree-mark {
		background-color: #ff7c7c;
	}

	.plan-radio:checked + .agree-mark::after {
		content: '✓';
	}

	.plan-radio:focus-visible + .agree-mark {
		outline: 2px solid #ff7c7c;
		outline-offset: 2px;
	}

	.agree a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* ===== 申込ボタン ===== */
	.apply-submit {
		display: block;
		width: 100%;
		margin-top: calc(9 * var(--u));
		padding: calc(10 * var(--u)) 0;
		border-radius: 9999px;
		background-color: #332932;
		color: #fff;
		font-family: inherit;
		font-size: calc(12 * var(--u));
		line-height: 1.2;
		letter-spacing: 0.08em;
		transition: opacity 0.2s ease;
	}

	.apply-submit:hover {
		opacity: 0.9;
	}

	.apply-submit:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.apply-caption {
		margin-top: calc(7 * var(--u));
		font-size: calc(8 * var(--u));
		text-align: center;
	}

	/* デザイン外。規約の確認先とペット導線は、短さを損なわないよう小さな1行に畳んでおく */
	.apply-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: calc(6 * var(--u)) calc(14 * var(--u));
		margin-top: calc(12 * var(--u));
		font-size: calc(9 * var(--u));
		letter-spacing: 0.04em;
		color: #7a626c;
	}

	.apply-links button {
		font-family: inherit;
		font-size: inherit;
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.apply-links button:hover {
		color: #000;
	}

	.apply-pet {
		margin-top: 10px;
	}

	/* ===== 処理中 ===== */
	.apply-processing {
		position: absolute;
		inset: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(26, 16, 22, 0.55);
		backdrop-filter: blur(2px);
	}

	.apply-processing__box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28px 32px;
		border-radius: 16px;
		background-color: #fff;
		text-align: center;
		box-shadow: 0 20px 50px rgba(38, 16, 31, 0.35);
	}

	.apply-processing__box p {
		margin-top: 16px;
		font-size: 13px;
		line-height: 1.7;
		color: #5f4b53;
	}

	.apply-processing__spinner {
		width: 36px;
		height: 36px;
		border: 3px solid #f0d6df;
		border-top-color: #ff7c7c;
		border-radius: 50%;
		animation: apply-spin 0.9s linear infinite;
	}

	@keyframes apply-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.apply-processing__spinner {
			animation-duration: 3s;
		}
	}
</style>
