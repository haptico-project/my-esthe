<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { agencyCode } from '$lib/agency/agencyCode';
	import { coupon, clearCoupon } from '$lib/coupon';
	import { postCheckout } from '$lib/checkoutAccessor';

	type CheckoutProduct = {
		productId: string;
		quantity: number;
	};

	type PlanOption = {
		id: string;
		name: string;
		description: string;
		priceLabel: string;
		amount: number;
		img: string;
		kind: 'one_time' | 'installment';
		checkoutPriceId?: string;
		orderProduct?: CheckoutProduct;
		badge: string;
		eyebrow: string;
	};

	type Plan = {
		id: string;
		name: string;
		description: string;
		price: number;
		priceLabel: string;
		afterPriceLabel?: string;
		img: string;
		accent: string;
		highlight: string;
		contents: string[];
		orderProducts: CheckoutProduct[];
		includedBenefits: string[];
		imageAlt: string;
		contentSummary: string;
		availableOptionIds: string[];
		popular?: boolean;
		eyebrow?: string;
		/** 顔マスク代の支払い月数（支払い完了後は ongoingPrice に下がる） */
		commitmentMonths?: number;
		/** 支払い完了後の月額（commitmentMonths 経過後） */
		ongoingPrice?: number;
	};

	const dispatch = createEventDispatcher();

	let selectedOptions: Record<string, boolean> = {};

	const toggleOption = (optionId: string) => {
		selectedOptions[optionId] = !selectedOptions[optionId];
	};

	const batteryOption: PlanOption = {
		id: 'mobile-battery',
		name: 'モバイルバッテリー',
		description:
			'外出先でも使いやすいモバイルバッテリーを買い切りで追加できます。どちらのプランでも追加できます。',
		priceLabel: '＋3,300円（初回のみ）',
		amount: 3300,
		img: `${base}/images/plans/option/kaomask.png`,
		kind: 'one_time',
		checkoutPriceId: 'price_1T94LZPo9yD7PttVjccfOWqk',
		badge: '買い切り',
		eyebrow: ''
	};

	const plans: Plan[] = [
		{
			id: 'face-mask-plan',
			name: '顔マスク付きプラン',
			description:
				'振動器と顔マスクがセットになった一番人気のプランです。顔マスク代は12ヶ月のお支払いで完了し、その後は顔マスクをそのままお使いいただけます。',
			price: 5500,
			priceLabel: '月額 5,500円（税込）',
			afterPriceLabel: '12ヶ月後、顔マスクはお客様のもの',
			img: `${base}/images/plans/face-mask.jpg`,
			accent: 'from-[#f1e5e9] via-[#fff7f7] to-[#efe7e2]',
			highlight: '振動器＋顔マスクのフルセット',
			contents: [
				'小型振動器（ポータブルタイプ）',
				'振動ヘッドキャップ',
				'顔マスク',
				'充電用USBケーブル'
			],
			orderProducts: [
				{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 },
				{ productId: 'price_1T94CTPo9yD7PttVbiyOrzT2', quantity: 1 }
			],
			includedBenefits: [
				'今は月額5,500円（税込）',
				'12ヶ月後、顔マスク代のお支払いが完了',
				'13ヶ月目以降は月額3,300円に',
				'ご家族やペットにも使える'
			],
			imageAlt: '顔マスク付きプランのセット',
			contentSummary: '振動器と顔マスクがそろった、一番人気のフルセットです。',
			availableOptionIds: ['mobile-battery'],
			popular: true,
			eyebrow: '人気No.1',
			commitmentMonths: 12,
			ongoingPrice: 3300
		},
		{
			id: 'standard-plan',
			name: '通常プラン',
			description:
				'まずはシンプルに始めたい方向けのプランです。自宅で気軽に、毎日のフェイスケア習慣を作れます。',
			price: 3300,
			priceLabel: '月額 3,300円（税込）',
			img: `${base}/images/plans/basic_2.jpg`,
			accent: 'from-[#f4e8ec] via-[#fffaf8] to-[#f3ece8]',
			highlight: '本体セットで気軽にスタート',
			contents: [
				'小型振動器（ポータブルタイプ）',
				'振動ヘッドキャップ',
				'充電用USBケーブル'
			],
			orderProducts: [{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 }],
			includedBenefits: [
				'月額3,300円（税込）でスタート',
				'ご自宅で続けやすい基本セット',
				'ご家族やペットにも使える'
			],
			imageAlt: '通常プランの美容機器セット',
			contentSummary: '毎日のケアを始めやすい基本セットです。',
			availableOptionIds: ['mobile-battery']
		}
	];

	const sharedOptions: PlanOption[] = [batteryOption];

	// 顔マスク付きプランは、12回で顔マスクを終了させる payflow 側のスケジュール登録が
	// 本番反映済みのため公開する。問題時は false に戻せば即時に非表示へ戻せる。
	const SHOW_FACE_MASK_PLAN = true;
	const visiblePlans = plans.filter((plan) => SHOW_FACE_MASK_PLAN || plan.id !== 'face-mask-plan');

	// キャンペーンクーポン（特定URL ?coupon=）適用時、顔マスク付きプランの顔マスク代(2,200円)が
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

	// ペット向けページへの導線（店舗コードを引き継ぐ）。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;

	let step = 1;
	let agreed = false;
	let selectedPlanId = '';
	let isProcessing = false;

	const next = () => {
		if (step === 1 && !agreed) return;
		step++;
	};

	const back = () => step > 1 && step--;
	const close = () => dispatch('close');

	const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;
	const selectedPlan = () => plans.find((plan) => plan.id === selectedPlanId);
	const availableOptions = (plan: Plan) =>
		sharedOptions.filter((option) => plan.availableOptionIds.includes(option.id));
	const selectedOptionList = (plan: Plan) =>
		availableOptions(plan).filter((option) => selectedOptions[option.id]);

	const planInitialAmount = (plan: Plan) => plan.price;
	const planRecurringAmount = (plan: Plan) => plan.price;
	const oneTimeOptionTotal = (options: PlanOption[]) =>
		options.filter((option) => option.kind === 'one_time').reduce((sum, option) => sum + option.amount, 0);
	const recurringOptionTotal = (options: PlanOption[]) =>
		options.filter((option) => option.kind === 'installment').reduce((sum, option) => sum + option.amount, 0);

	const selectPlan = (plan: Plan) => {
		selectedPlanId = plan.id;
		step = 3;
	};

	const goToCheckout = async () => {
		const currentPlan = selectedPlan();
		const code = get(agencyCode);
		const couponId = get(coupon);

		if (!code || !currentPlan) {
			alert('代理店コードまたは選択プランが未設定です。');
			return;
		}

		isProcessing = true;

		const currentUrl = get(page).url;
		const baseUrl = `${window.location.origin}${currentUrl.pathname}${currentUrl.search}`;
		const selectedOptionsForPlan = selectedOptionList(currentPlan);
		const oneTimePriceIds = selectedOptionList(currentPlan)
			.filter((option) => option.checkoutPriceId)
			.map((option) => option.checkoutPriceId as string);
		const orderProducts = [
			...currentPlan.orderProducts,
			...selectedOptionsForPlan
				.filter((option) => option.orderProduct)
				.map((option) => option.orderProduct as CheckoutProduct)
		];

		try {
			const res = await postCheckout('/api/v1/checkout/subscription-url', {
				checkoutSuccessUrl: baseUrl,
				checkoutCancelUrl: baseUrl,
				agencyCode: code,
				orderProducts,
				oneTimePriceIds,
				// クーポンは顔マスク付きプランにのみ渡す。FACEMASK3300 は全体割引(applies_to無)のため、
				// 通常プランに渡すと 3,300→1,100 と誤割引になる。対象プラン限定で防ぐ。
				...(couponId && currentPlan.id === CAMPAIGN_PLAN_ID ? { couponId } : {})
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

<div
	class="fixed inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.42),rgba(19,12,18,0.88))] p-2 sm:p-4 backdrop-blur-sm"
	style="font-family: 'hiragino-mincho-pro';"
>
	<div class="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#f0dbe3] bg-white p-5 shadow-[0_24px_60px_rgba(38,16,31,0.22)] sm:max-h-[90vh] sm:w-[94%] sm:p-8 lg:w-[88%]">
		<button class="absolute right-4 top-4 rounded-full border border-[#ead7df] bg-white px-3 py-1 text-sm text-[#7a626c] transition hover:bg-[#fbf2f6]" on:click={close}>閉じる</button>

		<div class="mb-7 border-b border-[#f0d6df] pb-4">
			<h2 class="text-2xl text-[#2e1d24]">お申し込み</h2>
		</div>

		{#if step === 1}
			<h3 class="mb-4 text-lg font-bold text-[#2e1d24]">ご利用規約の確認</h3>
			<div class="h-56 overflow-y-auto rounded-2xl border border-[#efdae2] bg-[#fffafc] p-5 text-sm leading-7 text-gray-700">
				<p>

					「わたしのエステ」美容機器サブスク利用規約<br />
					<br />
					本利用規約（以下「本規約」といいます）は、株式会社ファセテラピー（以下「当社」といいます）が提供する美容機器レンタルサービス（以下「本サービス」といいます）の利用条件を定めるものです。<br />
					利用者（以下「お客様」といいます）は、本規約に同意のうえ、本サービスを利用するものとします。<br />
					<br />
					⸻<br />
					<br />
					第1条（本サービスの内容）<br />
					1. 本サービスは、お客様が当社指定の美容機器（以下「レンタル機器」といいます）を、月額利用料を支払うことにより一定期間レンタルできるサービスです。<br />
					2. 本サービスの月額利用料は、1台あたり3,300円（税込）とします。ただし、当社が別途定める場合を除きます。<br />
					<br />
					⸻<br />
					<br />
					第2条（契約の成立および支払い方法）<br />
					1. お客様が当社指定の申込手続を完了し、当社が承諾した時点で、レンタル契約が成立します。<br />
					2. 利用料は、クレジットカードによる自動引き落としで支払うものとし、Stripe、GMOペイメントゲートウェイその他当社が指定する決済代行サービスを利用します。<br />
					3. クレジットカード決済が不成立となった場合、当社は自動的に再請求を行います。再請求後も支払いが確認できない場合、当社は本サービスを一時停止または契約を解除することができます。<br />
					<br />
					⸻<br />
					<br />
					第3条（本人確認）<br />
					1.
					当社は、未返却・転売防止のため、本人確認（運転免許証、マイナンバーカード、その他eKYC等）を求める場合があります。<br />
					2. 本人確認手続を完了できない場合、当社は申込を拒否または契約を解除できるものとします。<br />
					<br />
					⸻<br />
					<br />
					第4条（レンタル機器の引渡しおよび管理）<br />
					1. 当社は、申込後、指定住所へレンタル機器を発送します。<br />
					2. お客様は、受領後速やかに機器の状態を確認し、初期不良がある場合には7日以内に当社へ連絡するものとします。<br />
					3.
					お客様は、善良なる管理者の注意をもってレンタル機器を使用・保管するものとし、以下の行為を行ってはなりません。<br />
					　(1) 第三者への譲渡、転貸、担保設定<br />
					　(2) 分解、改造、修理、加工<br />
					　(3) 本来の目的以外での使用<br />
					<br />
					⸻<br />
					<br />
					第5条（支払い遅延・未払い対応）<br />
					1. クレジットカード決済が不成立の場合、当社は自動的に3〜5回の再請求を行います。<br />
					2.
					再請求後もお支払いが確認できない場合、当社はサービス提供を停止し、レンタル機器の返却を求めることができます。<br />
					3. 支払い遅延または返却が行われない場合、当社は商品を**販売扱い（買取扱い）**とし、当社が定める金額（機器の販売価格相当額）を請求することができます。<br />
					<br />
					⸻<br />
					<br />
					第6条（解約および返却義務）<br />
					1. お客様が解約を希望する場合は、当社指定のメールアドレス（tft.kao@gmail.com）または電話番号（03-3818-0408）宛にお問い合わせいただくものとします。<br />
					2. 当社は、解約のお申し出を受けた後、レンタル品の有無を確認し、レンタル品がある場合には集荷先を確認のうえ、集荷手続を行います。<br />
					3. 解約は、当社においてレンタル品の返却完了が確認された時点で完了するものとし、解約完了後は以後の月額利用料その他継続課金は発生しません。<br />
					4. 返却にかかる送料その他返却に要する費用の負担については、当社が別途定める方法に従うものとします。<br />
					<br />
					⸻<br />
					<br />
					第7条（故障・破損・紛失）<br />
					1. 使用中に故障が発生した場合、お客様は速やかに当社に連絡し、当社指定の返送先へ送付するものとします。その際の送料はお客様負担とします。<br />
					2. 当社が通常使用による自然故障と判断した場合は、当社の負担で修理または交換を行います。<br />
					3. お客様の過失、落下、水没、改造等による故障の場合、修理費または代替費用をお客様に請求することがあります。<br />
					4.
					お客様がレンタル機器を紛失または著しく破損した場合、当社が定める買取金額にて機器を買取いただくものとします。<br />
					<br />
					⸻<br />
					<br />
					第8条（契約期間・自動更新）<br />
					1. 契約期間は1ヶ月単位とし、特段の申出がない限り自動更新されます。<br />
					2. 解約を希望する場合は、第6条に定める方法に従い、当社へメールまたは電話にてご連絡いただくものとします。<br />
					<br />
					⸻<br />
					<br />
					第9条（禁止事項）<br />
					<br />
					お客様は、以下の行為を行ってはなりません。<br />
					1. 当社の許可なくレンタル機器を転売・譲渡・貸与する行為<br />
					2. 不正利用目的での契約（架空名義・虚偽情報による申込を含む）<br />
					3. 本サービスまたは他の利用者への迷惑・不利益を与える行為<br />
					<br />
					⸻<br />
					<br />
					第10条（免責事項）<br />
					1. 当社は、機器の使用によりお客様または第三者に生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。<br />
					2. 美容機器の使用により生じた肌トラブル・体調不良・アレルギー等についても、当社は責任を負いません。<br />
					<br />
					⸻<br />
					<br />
					第11条（個人情報の取扱い）<br />
					<br />
					当社は、本人確認、決済処理、サービス提供のためにお客様の個人情報を取得・利用し、法令およびプライバシーポリシーに従い適切に管理します。<br />
					<br />
					⸻<br />
					<br />
					第12条（規約の変更）<br />
					<br />
					当社は、必要に応じて本規約を改定することがあり、改定後の内容は当社ウェブサイトに掲示した時点で効力を生じます。<br />
					<br />
					⸻<br />
					<br />
					第13条（準拠法および合意管轄）<br />
					<br />
					本規約の解釈および適用は日本法に準拠し、本サービスに関して紛争が生じた場合は、当社所在地を管轄する地方裁判所または簡易裁判所を第一審の専属的合意管轄裁判所とします。<br />
					<br />
					⸻<br />
					<br />
					付則<br />
					<br />
					本規約は、2025年10月21日より施行します。<br />
					<br />
					⸻<br />
					<br />
					（当社指定の返却・送付先）<br />
					解約時または故障時の機器返却・送付先は、下記住所宛にお願いいたします。<br />
					<br />
					〒606-8023<br />
					京都府京都市左京区修学院水上田町5-11<br />
					ファセテラピー京都 宛<br />
				</p><br />
			</div>
			<label for="agree" class="mt-5 flex cursor-pointer items-center rounded-2xl bg-[#fff2f6] px-5 py-4">
				<input id="agree" type="checkbox" bind:checked={agreed} class="mr-3 h-4 w-4 accent-[#d45588]" />
				<span class="text-sm text-[#5f4b53]">利用規約に同意してプラン選択へ進みます</span>
			</label>
			<div class="mt-6 flex justify-end">
				<button class="rounded-full bg-[#26202a] px-7 py-3 text-sm text-white transition hover:bg-[#171317] disabled:opacity-40" on:click={next} disabled={!agreed}>
					プラン選択へ進む
				</button>
			</div>
		{:else if step === 2}
				<div class="mb-6">
				<div class="mb-6">
					{#if visiblePlans.length === 1}
						<h3 class="text-xl text-[#2e1d24] sm:text-2xl">プランのご案内</h3>
						<p class="mt-2 text-sm leading-7 text-[#6f5861]">毎日のフェイスケアを始めやすい通常プランです。モバイルバッテリーも追加できます。</p>
					{:else}
						<h3 class="text-xl text-[#2e1d24] sm:text-2xl">どちらにしますか？</h3>
						<p class="mt-2 text-sm leading-7 text-[#6f5861]">「顔マスク付きプラン」と「通常プラン」の2つから選ぶだけ。モバイルバッテリーはどちらにも追加できます。</p>
					{/if}
					<a
						href={petPageUrl}
						class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#c15582] underline underline-offset-2 transition hover:text-[#a84672]"
					>
						🐾 ペットと一緒に使いたい方はこちら
					</a>
					{#if couponValid === false}
						<p class="mt-3 rounded-lg bg-[#fdeef0] px-3 py-2 text-xs leading-5 text-[#c0395f]">
							無効なクーポンコードが指定されました。通常価格でのご案内となります。
						</p>
					{/if}
				</div>
				<div>
					<div class={visiblePlans.length === 1 ? 'mx-auto max-w-md' : 'grid gap-5 md:grid-cols-2'}>
						{#each visiblePlans as plan}
							<div class={`relative flex flex-col rounded-2xl p-5 ${plan.popular ? 'border border-[#d45588] bg-[#fffafc] shadow-[0_8px_24px_rgba(212,85,136,0.12)]' : 'border border-[#edd9e2] bg-white'}`}>
								{#if plan.eyebrow}
									<span class="absolute -top-3 left-5 rounded-full bg-[#d45588] px-3 py-1 text-xs font-semibold text-white">{plan.eyebrow}</span>
								{/if}

								<div class="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#faf2f5] px-4">
									<img src={plan.img} alt={plan.imageAlt} class="max-h-full w-full object-contain" />
								</div>

								<h4 class="mt-5 text-xl text-[#2e1d24] sm:text-2xl">{plan.name}</h4>
								<div class="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
									{#if campaignDiscount(plan) > 0}
										<span class="text-lg font-semibold text-[#b8a3ac] line-through">{formatCurrency(plan.price)}</span>
										<span class="text-3xl font-bold text-[#c15582]">月額 {formatCurrency(plan.price - campaignDiscount(plan))}（税込）</span>
										<span class="rounded-full bg-[#d45588] px-2.5 py-1 text-xs font-semibold text-white">キャンペーン適用中</span>
									{:else}
										<span class="text-3xl font-bold text-[#c15582]">{plan.priceLabel}</span>
										{#if plan.afterPriceLabel}
											<span class="rounded-full bg-[#fff0f5] px-3 py-1 text-xs font-semibold text-[#c15582]">{plan.afterPriceLabel}</span>
										{/if}
									{/if}
								</div>

								<p class="mt-4 text-sm leading-7 text-[#5f4b53]">{plan.description}</p>

								<div class="mt-5 border-t border-[#f0dde5] pt-5">
									<div class="text-xs font-semibold tracking-wide text-[#8d6f79]">料金のポイント</div>
									<ul class="mt-3 space-y-2 text-sm text-[#4d3b43]">
										{#each plan.includedBenefits as item}
											<li class="flex gap-2.5">
												<span class="mt-[3px] text-[#d56f97]">✓</span>
												<span class="leading-6">{item}</span>
											</li>
										{/each}
									</ul>
								</div>

								<div class="mt-5 border-t border-[#f0dde5] pt-5">
									<div class="text-xs font-semibold tracking-wide text-[#8d6f79]">セット内容</div>
									<ul class="mt-3 space-y-2 text-sm text-[#4d3b43]">
										{#each plan.contents as item}
											<li class="flex gap-2.5">
												<span class="mt-[3px] text-[#d56f97]">✓</span>
												<span class="leading-6">{item}</span>
											</li>
										{/each}
									</ul>
								</div>

								{#if availableOptions(plan).length > 0}
									<div class="mt-5 border-t border-[#f0dde5] pt-5">
										<div class="text-xs font-semibold tracking-wide text-[#8d6f79]">追加オプション</div>
										<div class="mt-3 space-y-3">
											{#each availableOptions(plan) as opt}
												<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0dde5] p-4 transition hover:border-[#e2bccb] hover:bg-[#fff7fa]">
													<input
														type="checkbox"
														class="mt-1 h-4 w-4 accent-[#d45588]"
														checked={selectedOptions[opt.id]}
														on:change={() => toggleOption(opt.id)}
													/>
													<div class="flex-1">
														<div class="flex items-center justify-between gap-2">
															<span class="text-sm font-semibold text-[#2e1d24]">{opt.name}</span>
															<span class="shrink-0 text-sm font-semibold text-[#c15582]">{opt.priceLabel}</span>
														</div>
														<p class="mt-1.5 text-xs leading-6 text-[#65515a]">{opt.description}</p>
													</div>
												</label>
											{/each}
										</div>
									</div>
								{/if}

								<button class="mt-6 w-full rounded-full bg-[#26202a] px-4 py-3 text-sm text-white transition hover:bg-[#171317]" on:click={() => selectPlan(plan)}>
									このプランで申し込む
								</button>
							</div>
						{/each}
					</div>

					</div>
				</div>
		{:else if step === 3}
			{@const currentPlan = selectedPlan()}
			{#if currentPlan === undefined}
				<p class="text-sm text-red-500">プラン情報の取得に失敗しました。</p>
				<button class="mt-4 text-gray-600 underline" on:click={() => (step = 2)}>プラン選択に戻る</button>
			{:else}
				{@const appliedOptions = selectedOptionList(currentPlan)}
				{@const planDiscount = campaignDiscount(currentPlan)}
				{@const totalFirst = planInitialAmount(currentPlan) + recurringOptionTotal(appliedOptions) + oneTimeOptionTotal(appliedOptions) - planDiscount}
				{@const totalMonthly = planRecurringAmount(currentPlan) + recurringOptionTotal(appliedOptions) - planDiscount}

					<div class="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
						<div class="rounded-2xl border border-[#efdbe3] bg-white p-5">
							<div class="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-[#faf2f5] px-4 sm:h-56">
								<img src={currentPlan.img} class="max-h-full w-full object-contain" alt={currentPlan.imageAlt} />
							</div>

							<h3 class="mt-5 text-xl text-[#2e1d24] sm:text-2xl">{currentPlan.name}</h3>
							<p class="mt-1 text-sm text-[#8f6c7a]">{currentPlan.highlight}</p>
							<p class="mt-4 text-sm leading-7 text-[#5f4b53]">{currentPlan.description}</p>

							<div class="mt-5 border-t border-[#f0dde5] pt-5">
								<div class="text-xs font-semibold tracking-wide text-[#8d6f79]">セット内容</div>
								<ul class="mt-3 space-y-2 text-sm text-[#4d3b43]">
									{#each currentPlan.contents as item}
										<li class="flex gap-2.5">
											<span class="mt-[3px] text-[#d56f97]">✓</span>
											<span class="leading-6">{item}</span>
										</li>
									{/each}
								</ul>
							</div>

							{#if appliedOptions.length > 0}
								<div class="mt-5 border-t border-[#f0dde5] pt-5">
									<div class="text-xs font-semibold tracking-wide text-[#8d6f79]">追加オプション</div>
									<div class="mt-3 space-y-3">
										{#each appliedOptions as opt}
											<div class="rounded-xl bg-[#fff7fa] p-4">
												<div class="flex items-center justify-between gap-3">
													<span class="text-sm font-semibold text-[#2e1d24]">{opt.name}</span>
													<span class="shrink-0 text-sm font-semibold text-[#c15582]">{opt.priceLabel}</span>
												</div>
												<p class="mt-1.5 text-xs leading-6 text-[#65515a]">{opt.description}</p>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<div class="rounded-2xl border border-[#efdbe3] bg-[#fff7fa] p-5">
							<h3 class="text-xl text-[#2e1d24] sm:text-2xl">ご注文内容の確認</h3>

							<div class="mt-5 rounded-2xl bg-[#2c1d25] p-5 text-white">
								<div class="text-sm text-white/70">初回のお支払い</div>
								<div class="mt-2 text-4xl font-bold">{formatCurrency(totalFirst)}</div>
								{#if planDiscount > 0}
									<div class="mt-4 space-y-1.5 text-sm text-white/80">
										<div>キャンペーン適用で<span class="font-semibold text-white">ずっと月額 {formatCurrency(totalMonthly)}</span></div>
									</div>
								{:else if currentPlan.commitmentMonths}
									<div class="mt-4 space-y-1.5 text-sm text-white/80">
										<div>今は<span class="font-semibold text-white">月額 {formatCurrency(totalMonthly)}</span>（{currentPlan.commitmentMonths}ヶ月間）</div>
										<div>{currentPlan.commitmentMonths + 1}ヶ月目以降は<span class="font-semibold text-white">月額 {formatCurrency(currentPlan.ongoingPrice ?? currentPlan.price)}</span></div>
									</div>
								{:else}
									<div class="mt-4 text-sm text-white/80">翌月以降 <span class="font-semibold text-white">月額 {formatCurrency(totalMonthly)}</span></div>
								{/if}
								{#if appliedOptions.some((opt) => opt.kind === 'one_time')}
									<div class="mt-3 text-xs text-white/55">※モバイルバッテリーは初回のみのお支払いです。</div>
								{/if}
							</div>

							<div class="mt-5 space-y-3 text-sm text-[#4d3b43]">
								<div class="rounded-xl bg-white p-4">
									<div class="flex items-center justify-between">
										<span>選択プラン</span>
										{#if planDiscount > 0}
											<span class="flex items-baseline gap-2">
												<span class="text-xs text-[#b8a3ac] line-through">{formatCurrency(currentPlan.price)}</span>
												<span class="font-semibold text-[#c15582]">月額 {formatCurrency(currentPlan.price - planDiscount)}</span>
											</span>
										{:else}
											<span class="font-semibold">月額 {formatCurrency(currentPlan.price)}</span>
										{/if}
									</div>
									<div class="mt-1.5 text-xs leading-6 text-[#7a626c]">{currentPlan.name}{#if planDiscount > 0}（キャンペーン適用）{/if}</div>
								</div>

								{#if appliedOptions.length > 0}
									<div class="rounded-xl bg-white p-4">
										<div class="mb-2 text-xs font-semibold tracking-wide text-[#8d6f79]">追加オプション</div>
										{#each appliedOptions as opt}
											<div class="flex items-center justify-between py-1 text-sm text-[#6f5861]">
												<span>{opt.name}</span>
												<span>{formatCurrency(opt.amount)}</span>
											</div>
										{/each}
									</div>
								{/if}

								{#if planDiscount > 0}
									<div class="rounded-xl border border-dashed border-[#dfb2c3] p-4 text-xs leading-6 text-[#7a626c]">
										キャンペーン適用中につき、顔マスク代が割引され、ご契約中はずっと月額{formatCurrency(currentPlan.price - planDiscount)}（税込）です。顔マスクは{currentPlan.commitmentMonths}ヶ月後にそのままお客様のものになります。
									</div>
								{:else if currentPlan.commitmentMonths}
									<div class="rounded-xl border border-dashed border-[#dfb2c3] p-4 text-xs leading-6 text-[#7a626c]">
										顔マスク付きプランは「振動器 月額3,300円 ＋ 顔マスク代」の構成です。顔マスク代のお支払いは{currentPlan.commitmentMonths}ヶ月で完了し、その後は顔マスクをそのままお使いいただきながら、月額{formatCurrency(currentPlan.ongoingPrice ?? currentPlan.price)}になります。
									</div>
								{/if}
							</div>

							<div class="mt-6 flex flex-col gap-3">
								<button class="w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72] disabled:opacity-50" on:click={goToCheckout} disabled={isProcessing}>
									{isProcessing ? '処理中...' : '決済に進む'}
								</button>
								<button class="w-full rounded-full border border-[#d7b0c1] px-5 py-3 text-sm text-[#5f4b53] transition hover:bg-white" on:click={back} disabled={isProcessing}>
									プラン選択に戻る
								</button>
							</div>
						</div>
					</div>
			{/if}
		{/if}
	</div>
</div>
