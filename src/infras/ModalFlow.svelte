<script lang="ts">
	import { base } from '$app/paths';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { postCheckout } from '$lib/checkoutAccessor';
	import { agencyCode } from '$lib/agency/agencyCode';

	const dispatch = createEventDispatcher();

	/* ---------------------------------------------------
	   1. Read more
	--------------------------------------------------- */
	let expanded: Record<string, boolean> = {};
	const toggleExpand = (id: string) => (expanded[id] = !expanded[id]);

	/* ---------------------------------------------------
	   2. Options
	--------------------------------------------------- */
	let selectedOptions: Record<string, boolean> = {};

	const toggleOption = (optionId: string, plan: any) => {
		selectedOptions[optionId] = !selectedOptions[optionId];

		const opt = plan.options.find((o: any) => o.id === optionId);

		// overwrite ON
		if (opt && opt.overwrite && selectedOptions[optionId]) {
			selectedPlan = opt.id;
		}

		// overwrite OFF
		if (opt && opt.overwrite && !selectedOptions[optionId]) {
			const otherOverwrite = plan.options.find(
				(o: any) => o.overwrite && selectedOptions[o.id]
			);

			if (otherOverwrite) {
				selectedPlan = otherOverwrite.id;
			} else {
				selectedPlan = plan.id;
			}
		}
	};

	/* ---------------------------------------------------
	   3. Plans
	--------------------------------------------------- */
	const plans = [
		{
			id: 'price_1SUdstPo9yD7PttV1EclsBsi',
			name: 'エステのサブスク（¥3,300/月）',
			price: 3300,
			subscription: true,
			img: `${base}/images/plans/basic.jpg`,
			description:
				'自然の森で採取した微細な振動データを基に設計された「小型振動器」で、顔全体に心地よいリズム刺激を与えるベーシックコースです。',
			contents: [
				'小型振動器（ポータブルタイプ）',
				'振動ヘッドキャップ',
				'充電用USBケーブル',
				'携帯用ポーチ'
			],
			options: [
				{
					id: 'price_1SUdvUPo9yD7PttVITtHasG5',
					name: '顔型マスク',
					img: `${base}/images/plans/option/kaomask.png`,
					description: '買い切りの顔型マスクです。フェイスシートの上から重ねて振動を伝えるプレミアムケアができます。（初回のみ + ¥22,000）',
					price: 22000,
					subscription: false,
					overwrite: true
				}
			]
		}
	];

	/* ---------------------------------------------------
	   4. Steps
	--------------------------------------------------- */
	let step = 1;
	let agreed = false;
	let selectedPlan = '';
	let isProcessing = false;

	const next = () => {
		if (step === 1 && !agreed) return;
		step++;
	};

	const back = () => step > 1 && step--;
	const close = () => dispatch('close');

	/* ---------------------------------------------------
	   5. Checkout
	--------------------------------------------------- */
	const goToCheckout = async () => {
		isProcessing = true;
		const code = get(agencyCode);

		const orderProducts = [{ productId: selectedPlan, quantity: 1 }];

		if (!code || !selectedPlan) {
			alert('代理店コードまたは選択プランが未設定です。');
			isProcessing = false;
			return;
		}

		const currentUrl = get(page).url;
		const baseUrl = `${window.location.origin}${currentUrl.pathname}${currentUrl.search}`;

		try {
			const res = await postCheckout('/api/v1/checkout/subscription-url', {
				checkoutSuccessUrl: baseUrl,
				checkoutCancelUrl: baseUrl,
				agencyCode: code,
				orderProducts
			});

			if (res) window.location.href = res as string;
			else alert('リダイレクト先が取得できませんでした。');
		} catch (err) {
			console.error(err);
			alert('決済処理中にエラーが発生しました。');
		} finally {
			isProcessing = false;
			close();
		}
	};

	/* ---------------------------------------------------
	   6. select plan
	--------------------------------------------------- */
	const selectPlan = (plan: any) => {
		selectedPlan = plan.id;
		step = 3;

		// overwrite の場合は優先
		const ow = plan.options?.find(o => o.overwrite && selectedOptions[o.id]);
		if (ow) selectedPlan = ow.id;
	};
</script>

<!-- ===================================================== -->
<!-- モーダル -->
<!-- ===================================================== -->
<div
	class="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center"
	style="font-family: 'hiragino-mincho-pro';"
>
	<div class="bg-[#FFFE] rounded-md shadow-lg w-[90%] max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
		<button class="absolute top-3 right-3 text-gray-500" on:click={close}>✕</button>

		<!-- STEP 1 -->
		{#if step === 1}
			<h2 class="text-lg font-bold mb-3">利用規約</h2>

			<div class="border rounded-lg h-48 overflow-y-auto p-2 text-sm text-gray-700">
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

			<div class="flex items-center mt-4">
				<input id="agree" type="checkbox" bind:checked={agreed} class="mr-2" />
				<label for="agree" class="text-sm text-gray-700">利用規約に同意します</label>
			</div>

			<div class="flex justify-end mt-6">
				<button class="bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50" on:click={next} disabled={!agreed}>
					次へ
				</button>
			</div>

			<!-- STEP 2 -->
		{:else if step === 2}
			<h2 class="text-lg font-bold mb-4">プランを選択してください</h2>

			<div class="space-y-4">
				{#each plans as plan}
					<div class="border rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
							 on:click={() => selectPlan(plan)}
					>
						<!-- 画像 -->
						<div class="w-full h-48 bg-black/5 overflow-hidden">
							<img src="{plan.img}" alt="{plan.name}" class="w-full h-full object-cover" />
						</div>

						<div class="p-4">
							<div class="font-bold text-base">{plan.name}</div>

							<p class="text-sm text-gray-700 mt-2 leading-relaxed">
								{#if plan.description.length <= 58}
									{plan.description}
								{:else}
									{expanded[plan.id]
										? plan.description
										: plan.description.slice(0, 58) + '...'}
								{/if}
							</p>

							{#if plan.description.length > 58}
								<button
									class="text-xs text-pink-500 mt-1 underline"
									on:click|stopPropagation={() => toggleExpand(plan.id)}
								>
									{expanded[plan.id] ? '閉じる ▲' : '続きを読む ▼'}
								</button>
							{/if}

							<!-- オプション -->
							{#if plan.options?.length}
								<div class="mt-4">
									<div class="text-sm font-semibold">オプション（任意）</div>

									{#each plan.options as opt}
										<div
											class="mt-2 p-2 border rounded flex space-x-3 items-start cursor-pointer"
											on:click|stopPropagation={() => toggleOption(opt.id, plan)}
										>
											<input
												type="checkbox"
												checked={selectedOptions[opt.id]}
												on:click|stopPropagation
												on:change={() => toggleOption(opt.id, plan)}
											/>

											<img src="{opt.img}" class="w-16 h-16 object-cover rounded" />

											<div class="flex-1">
												<div class="font-medium text-sm">{opt.name}</div>
												<p class="text-xs text-gray-600 mt-1">{opt.description}</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}

							<button
								class="mt-3 w-full bg-gray-800 text-white rounded py-2 text-sm"
								on:click|stopPropagation={() => selectPlan(plan)}
							>
								このプランを選択
							</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- STEP 3 -->
		{:else if step === 3}
			<h2 class="text-lg font-bold mb-3">ご注文内容の確認</h2>

			<button
				class="mb-4 w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
				on:click={goToCheckout}
			>
				決済に進む
			</button>

			<!-- ▼ selectedPlan がオプションIDの場合にも対応して親プランを取得 -->
			{@const parentPlan =
				plans.find(pl => pl.id === selectedPlan) ??
				plans.find(pl => pl.options?.some(o => o.id === selectedPlan))
			}

			<!-- 念のため parentPlan が存在しない場合の fallback -->
			{#if parentPlan === undefined}
				<p class="text-red-500 text-sm">プラン情報の取得に失敗しました。</p>
				<button class="mt-4 text-gray-600 underline" on:click={() => (step = 2)}>
					プラン選択に戻る
				</button>
			{:else}

				<!-- 親プラン基準でオプション取得 -->
				{@const appliedOptions =
					(parentPlan.options || []).filter(o => selectedOptions[o.id])
				}

				{@const baseFirst = parentPlan.price}
				{@const baseMonthly = parentPlan.subscription ? parentPlan.price : 0}

				{@const optionFirst = appliedOptions
					.filter(o => !o.subscription)
					.reduce((sum, o) => sum + o.price, 0)
				}

				{@const optionMonthly = appliedOptions
					.filter(o => o.subscription)
					.reduce((sum, o) => sum + o.price, 0)
				}

				{@const totalFirst = baseFirst + optionFirst + optionMonthly}
				{@const totalMonthly = baseMonthly + optionMonthly}

				<!-- 画像は普通の img で表示 -->
				<img src="{parentPlan.img}" class="w-full rounded mb-3" alt="選択プラン" />

				<div class="border rounded-lg p-3 bg-white space-y-3">
					<div class="font-bold text-base">{parentPlan.name}</div>

					<p class="text-sm leading-relaxed">{parentPlan.description}</p>

					<div>
						<div class="text-xs text-gray-500 mt-1">付属品</div>
						<ul class="list-disc pl-5 text-sm">
							{#each parentPlan.contents as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>

					{#if appliedOptions.length > 0}
						<div>
							<div class="text-xs text-gray-500">オプション</div>
							<ul class="list-disc pl-5 text-sm">
								{#each appliedOptions as opt}
									<li>
										{opt.name}
										{#if !opt.subscription}
											（+ ¥{opt.price.toLocaleString()} ※初回のみ）
										{:else}
											（+ ¥{opt.price.toLocaleString()}/月）
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="mt-4 p-3 bg-pink-50 rounded">
						<div class="font-bold text-sm text-pink-700">今回のご請求金額</div>

						<div class="text-2xl font-extrabold text-pink-600 mt-1">
							¥{totalFirst.toLocaleString()}
						</div>

						<div class="mt-3 text-sm text-gray-700">
							内訳：
							<ul class="list-disc pl-5 mt-1 space-y-1">
								<li>プラン料金：¥{baseFirst.toLocaleString()}</li>

								{#if optionFirst > 0}
									<li>オプション（初回のみ）：¥{optionFirst.toLocaleString()}</li>
								{/if}

								{#if optionMonthly > 0}
									<li>オプション（月額分）：¥{optionMonthly.toLocaleString()}</li>
								{/if}
							</ul>
						</div>

						<div class="mt-4 text-sm text-gray-600 border-t pt-3">
							翌月以降：
							<span class="font-bold text-gray-800">
						¥{totalMonthly.toLocaleString()}/月<br />
					</span>
						</div>
					</div>
				</div>

			{/if}

			<div class="flex justify-between mt-6">
				<button class="text-gray-600" on:click={back}>戻る</button>
				<button class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600" on:click={goToCheckout}>
					決済に進む
				</button>
			</div>
		{/if}

	</div>
</div>
