<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { agencyCode } from '$lib/agency/agencyCode';
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
	};

	const dispatch = createEventDispatcher();

	let expanded: Record<string, boolean> = {};
	let selectedOptions: Record<string, boolean> = {};

	const toggleExpand = (id: string) => (expanded[id] = !expanded[id]);
	const toggleOption = (optionId: string) => {
		selectedOptions[optionId] = !selectedOptions[optionId];
	};

	const batteryOption: PlanOption = {
		id: 'mobile-battery',
		name: 'オプションバッテリー',
		description:
			'外出先でも使いやすいモバイルバッテリーを買い切りで追加できます。どのプランでも同時に申し込めます。',
		priceLabel: '＋3,300円 / 初回のみ',
		amount: 3300,
		img: `${base}/images/plans/option/kaomask.png`,
		kind: 'one_time',
		checkoutPriceId: 'price_1T94LZPo9yD7PttVjccfOWqk',
		badge: '買い切り',
		eyebrow: ''
	};

	const faceMaskSetOption: PlanOption = {
		id: 'face-mask-set',
		name: '顔マスクセット',
		description:
			'顔マスクを月額2,200円で12ヶ月お支払いいただく追加オプションです。通常プランに追加して申し込めます。',
		priceLabel: '＋2,200円 / 月 × 12ヶ月',
		amount: 2200,
		img: `${base}/images/plans/option/kaomask.png`,
		kind: 'installment',
		orderProduct: { productId: 'price_1T94CTPo9yD7PttVbiyOrzT2', quantity: 1 },
		badge: '12回払い',
		eyebrow: ''
	};

	const plans: Plan[] = [
		{
			id: 'standard-plan',
			name: '通常プラン',
			description:
				'まずはシンプルに始めたい方向けのベーシックプランです。自宅で気軽に、毎日のフェイスケア習慣を作れます。',
			price: 3300,
			priceLabel: '月額 3,300円',
			img: `${base}/images/plans/basic.jpg`,
			accent: 'from-[#f4e8ec] via-[#fffaf8] to-[#f3ece8]',
			highlight: '本体セットのみで気軽にスタート',
			contents: [
				'小型振動器（ポータブルタイプ）',
				'振動ヘッドキャップ',
				'充電用USBケーブル',
				'携帯用ポーチ'
			],
			orderProducts: [{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 }],
			includedBenefits: [
				'月額3,300円でスタート',
				'ご自宅で続けやすい基本セット',
				'顔マスクセットやバッテリーを追加可能'
			],
			imageAlt: '通常プランの美容機器セット',
			contentSummary: '毎日のケアを始めやすい基本セットです。',
			availableOptionIds: ['mobile-battery', 'face-mask-set']
		},
		{
			id: 'face-mask-plan',
			name: '顔マスクプラン',
			description:
				'通常プランをすでにご利用中の方が、顔マスクのみを追加したい場合のプランです。月額2,200円を12ヶ月お支払いいただきます。',
			price: 2200,
			priceLabel: '月額 2,200円 × 12ヶ月',
			img: `${base}/images/plans/special.jpg`,
			accent: 'from-[#f1e5e9] via-[#fff7f7] to-[#efe7e2]',
			highlight: '通常プランご利用中の方向けの顔マスク追加プラン',
			contents: ['顔マスク（月額2,200円 × 12ヶ月）'],
			orderProducts: [{ productId: 'price_1T94CTPo9yD7PttVbiyOrzT2', quantity: 1 }],
			includedBenefits: [
				'月額2,200円を12ヶ月お支払い',
				'通常プランご利用中の方向け',
				'通常プランにご加入いただいていない場合はご利用いただけません',
				'モバイルバッテリーの追加も可能'
			],
			imageAlt: '顔マスクプランのイメージ',
			contentSummary: '通常プランご利用中の方が顔マスクのみを追加したい場合の12ヶ月プランです。',
			availableOptionIds: ['mobile-battery']
		}
	];

	const sharedOptions: PlanOption[] = [batteryOption, faceMaskSetOption];

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
				oneTimePriceIds
			});

			if (res) {
				window.location.href = res as string;
				return;
			}
			alert('リダイレクト先が取得できませんでした。');
		} catch (err) {
			console.error(err);
			alert('決済処理中にエラーが発生しました。');
		} finally {
			isProcessing = false;
		}
	};
</script>

<div
	class="fixed inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.42),rgba(19,12,18,0.88))] p-2 sm:p-4 backdrop-blur-sm"
	style="font-family: 'hiragino-mincho-pro';"
>
	<div class="relative max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[22px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,250,0.94))] p-3 shadow-[0_28px_80px_rgba(38,16,31,0.28)] sm:max-h-[90vh] sm:w-[96%] sm:rounded-[28px] sm:border-white/50 sm:p-6 lg:w-[94%] lg:p-8">
		<button class="absolute right-4 top-4 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-gray-600 transition hover:bg-white" on:click={close}>閉じる</button>

		<div class="mb-6 border-b border-[#f0d6df] pb-4">
			<h2 class="mt-2 text-2xl text-[#2e1d24]">お申し込み</h2>
		</div>

		{#if step === 1}
			<h3 class="mb-3 text-lg font-bold text-[#2e1d24]">ご利用規約の確認</h3>
			<div class="h-56 overflow-y-auto rounded-[20px] border border-[#efdae2] bg-white/80 p-4 text-sm leading-7 text-gray-700">
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
					4. お客様は、初回登録時に保証金（デポジット）として3,300円（または当社が別途指定する金額）を支払うものとします。保証金は、契約終了時に未払い金や損害がない場合に限り返金されます。<br />
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
					4. 当社は、未払い金がある場合、保証金から差引し、不足があればお客様に請求することができます。<br />
					<br />
					⸻<br />
					<br />
					第6条（解約および返却義務）<br />
					1. お客様が解約を希望する場合、当社指定の方法で解約申請を行うものとします。<br />
					2. 解約申請後も、当社が機器の返却を確認するまでは契約が継続中とみなされ、月額利用料の請求（カード決済）は継続します。<br />
					3. 当社が返却確認を行った時点で、契約終了とみなします。<br />
					4. 返却にかかる送料はお客様負担とします。<br />
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
					2. 解約希望は、当月〇日までに当社指定の方法で行うものとします。<br />
					<br />
					⸻<br />
					<br />
					第9条（保証金の取り扱い）<br />
					1. 当社は、保証金を契約中預かり金として保管します。<br />
					2. 契約終了後、未払い・損害がない場合に限り、保証金を全額返金します。<br />
					3. 未返却・破損・未払いがある場合は、保証金を充当し、不足分をお客様に請求します。<br />
					<br />
					⸻<br />
					<br />
					第10条（禁止事項）<br />
					<br />
					お客様は、以下の行為を行ってはなりません。<br />
					1. 当社の許可なくレンタル機器を転売・譲渡・貸与する行為<br />
					2. 不正利用目的での契約（架空名義・虚偽情報による申込を含む）<br />
					3. 本サービスまたは他の利用者への迷惑・不利益を与える行為<br />
					<br />
					⸻<br />
					<br />
					第11条（免責事項）<br />
					1. 当社は、機器の使用によりお客様または第三者に生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。<br />
					2. 美容機器の使用により生じた肌トラブル・体調不良・アレルギー等についても、当社は責任を負いません。<br />
					<br />
					⸻<br />
					<br />
					第12条（個人情報の取扱い）<br />
					<br />
					当社は、本人確認、決済処理、サービス提供のためにお客様の個人情報を取得・利用し、法令およびプライバシーポリシーに従い適切に管理します。<br />
					<br />
					⸻<br />
					<br />
					第13条（規約の変更）<br />
					<br />
					当社は、必要に応じて本規約を改定することがあり、改定後の内容は当社ウェブサイトに掲示した時点で効力を生じます。<br />
					<br />
					⸻<br />
					<br />
					第14条（準拠法および合意管轄）<br />
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
			<div class="mt-5 flex items-center rounded-2xl bg-[#fff2f6] px-4 py-3">
				<input id="agree" type="checkbox" bind:checked={agreed} class="mr-3 h-4 w-4 accent-pink-500" />
				<label for="agree" class="text-sm text-gray-700">利用規約に同意してプラン選択へ進みます</label>
			</div>
			<div class="mt-6 flex justify-end">
				<button class="rounded-full bg-[#26202a] px-6 py-3 text-sm text-white disabled:opacity-40" on:click={next} disabled={!agreed}>
					プラン選択へ進む
				</button>
			</div>
		{:else if step === 2}
				<div class="mb-4 overflow-hidden bg-transparent sm:mb-6">
				<div class="relative h-[220px] overflow-hidden">
					<img src={`${base}/images/plans/special.jpg`} alt="プラン比較イメージ" class="h-full w-full object-cover" />
					<div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,24,31,0.12),rgba(40,24,31,0.58))]" />
					<div class="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
						<h3 class="text-xl sm:text-2xl">プランを比べて選ぶ</h3>
						<p class="mt-2 text-sm leading-6 text-white/85">通常プランと顔マスクプランを見比べながら選べます。通常プランには顔マスクセットを追加できます。</p>
					</div>
				</div>
				<div class="bg-transparent p-0">
					<div class="grid gap-3 md:grid-cols-2 md:gap-4">
						{#each plans as plan}
							<div class="rounded-[18px] border border-[#edd9e2]/45 bg-white/92 p-3 shadow-[0_8px_20px_rgba(65,29,45,0.04)] sm:rounded-[20px] sm:p-4 md:shadow-none">
								<div class="overflow-hidden rounded-[16px] bg-[#f8eef2] sm:rounded-[20px]">
									<img src={plan.img} alt={plan.imageAlt} class="h-32 w-full object-cover sm:h-40 md:h-32 lg:h-40" />
								</div>

								<div class="pb-2">
									<h4 class="mt-3 text-lg text-[#2e1d24] sm:mt-4 sm:text-xl lg:text-2xl">{plan.name}</h4>
									<div class="mt-2 space-y-1">
										<div class="text-sm font-semibold text-[#8f6c7a]">{plan.priceLabel}</div>
										{#if plan.afterPriceLabel}
											<div class="text-sm font-semibold text-[#c15582]">{plan.afterPriceLabel}</div>
										{/if}
									</div>
								</div>

								<div class="mt-3">
									<p class="rounded-[12px] bg-[#fff5f8] px-3 py-2 text-sm leading-6 text-[#6f5861]">{plan.highlight}</p>

									<p class="mt-3 text-sm leading-6 text-[#5f4b53]">
										{#if plan.description.length <= 104}
											{plan.description}
										{:else}
											{expanded[plan.id] ? plan.description : `${plan.description.slice(0, 104)}...`}
										{/if}
									</p>

									{#if plan.description.length > 104}
										<button class="mt-2 text-xs text-[#c15582] underline" on:click|stopPropagation={() => toggleExpand(plan.id)}>
											{expanded[plan.id] ? '説明を閉じる' : '詳しく見る'}
										</button>
									{/if}
								</div>

								<div class="mt-4 space-y-3">
									<div class="border-t border-[#f0dde5]/70 pt-3">
										<div class="text-xs text-[#8d6f79]">料金</div>
										<ul class="mt-2 space-y-1.5 text-sm text-[#4d3b43]">
											{#each plan.includedBenefits as item}
												<li class="flex gap-2">
													<span class="mt-[2px] text-[#d56f97]">●</span>
													<span>{item}</span>
												</li>
											{/each}
										</ul>
									</div>

									<div class="border-t border-[#f0dde5]/70 pt-3">
										<div class="text-xs text-[#8d6f79]">セット内容</div>
										<p class="mt-2 text-xs leading-6 text-[#7d6670]">{plan.contentSummary}</p>
										<div class="mt-2 grid gap-2">
											{#each plan.contents as item}
												<div class="rounded-[10px] bg-[#fffafc] px-2.5 py-2 text-sm text-[#4d3b43]">
													<div class="flex gap-2">
														<span class="mt-[2px] text-[#d56f97]">●</span>
														<span>{item}</span>
													</div>
												</div>
											{/each}
										</div>
									</div>

									{#if availableOptions(plan).length > 0}
										<div class="border-t border-[#f0dde5]/70 pt-3">
											<div class="text-xs text-[#8d6f79]">追加オプション</div>
											<div class="mt-2 space-y-2">
												{#each availableOptions(plan) as opt}
												<label class="flex cursor-pointer items-start gap-2.5 rounded-[10px] bg-[#fff9fb] p-2.5 transition hover:bg-[#fff2f6]">
													<input
														type="checkbox"
														class="mt-1 h-4 w-4 accent-pink-500"
														checked={selectedOptions[opt.id]}
														on:change={() => toggleOption(opt.id)}
													/>
														<div class="flex-1">
															<div class="flex flex-wrap items-center gap-2">
																<span class="rounded-full bg-[#2e1d24] px-2 py-1 text-[10px] tracking-[0.18em] text-white">{opt.badge}</span>
															</div>
														<div class="mt-1 text-sm font-semibold text-[#2e1d24]">{opt.name}</div>
														<p class="mt-1 text-xs leading-5 text-[#65515a]">{opt.description}</p>
														<div class="mt-1 text-sm text-[#c15582]">{opt.priceLabel}</div>
													</div>
												</label>
												{/each}
											</div>
										</div>
									{/if}
								</div>

								<button class="mt-4 w-full rounded-full bg-[#26202a] px-4 py-2.5 text-sm text-white transition hover:bg-[#171317]" on:click={() => selectPlan(plan)}>
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
				{@const totalFirst = planInitialAmount(currentPlan) + recurringOptionTotal(appliedOptions) + oneTimeOptionTotal(appliedOptions)}
				{@const totalMonthly = planRecurringAmount(currentPlan) + recurringOptionTotal(appliedOptions)}

					<div class="grid gap-4 md:grid-cols-[1.05fr_0.95fr] sm:gap-5">
						<div class="overflow-hidden rounded-[20px] border border-[#efdbe3]/60 bg-white shadow-[0_12px_28px_rgba(65,29,45,0.06)] sm:rounded-[28px] sm:border-[#efdbe3] sm:shadow-[0_18px_40px_rgba(65,29,45,0.08)]">
							<div class={`relative min-h-[250px] overflow-hidden bg-gradient-to-br ${currentPlan.accent}`}>
								<img src={currentPlan.img} class="h-full w-full object-cover mix-blend-multiply opacity-90" alt={currentPlan.imageAlt} />
								<div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.42))]" />
								<div class="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
									<h3 class="mt-2 text-xl sm:text-2xl">{currentPlan.name}</h3>
									<p class="mt-2 text-sm text-white/80">{currentPlan.highlight}</p>
								</div>
						</div>

							<div class="space-y-4 p-3 sm:space-y-5 sm:p-5">
								<div>
									<p class="text-sm leading-7 text-[#5f4b53]">{currentPlan.description}</p>
								</div>

								<div>
									<div class="text-xs text-[#8d6f79]">セット内容</div>
								<p class="mt-2 text-xs leading-6 text-[#7d6670]">{currentPlan.contentSummary}</p>
								<div class="mt-3 grid gap-2 sm:grid-cols-2">
									{#each currentPlan.contents as item}
										<div class="rounded-[12px] border border-[#f0dde5]/70 bg-[#fffafc] px-2.5 py-2.5 text-sm text-[#4d3b43] sm:rounded-[16px] sm:border-[#f0dde5] sm:px-3 sm:py-3">
											<div class="flex gap-2">
												<span class="mt-[2px] text-[#d56f97]">●</span>
												<span>{item}</span>
											</div>
										</div>
									{/each}
								</div>
							</div>

								{#if appliedOptions.length > 0}
									<div>
										<div class="text-xs text-[#8d6f79]">追加オプション</div>
									<div class="mt-3 space-y-3">
										{#each appliedOptions as opt}
												<div class="rounded-[14px] bg-[#fff5f8] p-3 sm:rounded-[18px] sm:p-4">
												<div class="flex items-center justify-between gap-3">
													<div>
														<div class="text-sm font-semibold text-[#2e1d24]">{opt.name}</div>
														<div class="mt-1 text-xs leading-6 text-[#65515a]">{opt.description}</div>
													</div>
													<div class="shrink-0 text-sm text-[#c15582]">{opt.priceLabel}</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>

						<div class="rounded-[20px] border border-[#efdbe3]/60 bg-[linear-gradient(180deg,#fffdfd,#fff2f6)] p-3 shadow-[0_12px_28px_rgba(65,29,45,0.06)] sm:rounded-[28px] sm:border-[#efdbe3] sm:p-5 sm:shadow-[0_18px_40px_rgba(65,29,45,0.08)]">
							<h3 class="mt-2 text-xl text-[#2e1d24] sm:text-2xl">ご注文内容の確認</h3>

							<div class="mt-4 flex flex-col gap-3">
								<button class="w-full rounded-full bg-[#d45588] px-5 py-3 text-sm text-white transition hover:bg-[#be3d72] disabled:opacity-50" on:click={goToCheckout} disabled={isProcessing}>
									{isProcessing ? '処理中...' : '決済に進む'}
								</button>
								<button class="w-full rounded-full border border-[#d7b0c1] px-5 py-3 text-sm text-[#5f4b53]" on:click={back} disabled={isProcessing}>
									プラン選択に戻る
								</button>
							</div>

							<div class="mt-4 rounded-[18px] bg-[#2c1d25] p-4 text-white sm:mt-5 sm:rounded-[22px] sm:p-5">
								<div class="text-sm text-white/70">初回のお支払い</div>
								<div class="mt-2 text-4xl">{formatCurrency(totalFirst)}</div>
								{#if currentPlan.id === 'face-mask-plan' || appliedOptions.some((opt) => opt.id === 'face-mask-set')}
									<div class="mt-3 space-y-1 text-sm text-white/70">
										<div>12ヶ月間 {formatCurrency(totalMonthly)}/月</div>
										{#if currentPlan.id === 'standard-plan'}
											<div>13ヶ月目以降 {formatCurrency(currentPlan.price)}/月</div>
										{/if}
									</div>
								{:else}
									<div class="mt-3 text-sm text-white/70">翌月以降 {formatCurrency(totalMonthly)}/月</div>
								{/if}
							</div>

							<div class="mt-4 space-y-3 text-sm text-[#4d3b43] sm:mt-5 sm:space-y-4">
								<div class="rounded-[14px] bg-white/80 p-3 sm:rounded-[18px] sm:p-4">
									<div class="flex items-center justify-between">
										<span>選択プラン</span>
										<span>{currentPlan.id === 'face-mask-plan' ? '月額 2,200円 × 12ヶ月' : `${formatCurrency(currentPlan.price)}/月`}</span>
									</div>
									<div class="mt-2 text-xs leading-6 text-[#7a626c]">{currentPlan.name}</div>
									{#if currentPlan.id === 'face-mask-plan'}
										<div class="mt-2 rounded-[12px] bg-[#fff4f7] p-3 text-xs leading-6 text-[#7a626c] sm:rounded-[14px]">
											顔マスクプランは、通常プランをすでにご利用中の方が顔マスクのみを追加するためのプランです。通常プランにご加入いただいていない場合はご利用いただけません。
										</div>
									{/if}
								</div>

							{#if appliedOptions.length > 0}
									<div class="rounded-[14px] bg-white/80 p-3 sm:rounded-[18px] sm:p-4">
									<div class="mb-2">追加オプション</div>
									{#each appliedOptions as opt}
										<div class="flex items-center justify-between py-1 text-xs text-[#6f5861]">
											<span>{opt.name}</span>
											<span>{formatCurrency(opt.amount)}</span>
										</div>
									{/each}
								</div>
							{/if}

							{#if currentPlan.id === 'standard-plan' && appliedOptions.some((opt) => opt.id === 'face-mask-set')}
								<div class="rounded-[14px] border border-dashed border-[#dfb2c3] p-3 text-xs leading-6 text-[#7a626c] sm:rounded-[18px] sm:p-4">
									通常プランに顔マスクセットを追加した場合は「基本プラン 3,300円/月 + 顔マスクセット 2,200円/月」の構成です。顔マスクセットのお支払いは12ヶ月で終了し、その後は通常プランの月額3,300円のみになります。
								</div>
							{/if}
						</div>

					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
