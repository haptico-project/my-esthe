<!-- 紹介用URL(?ref)で来訪した際の紹介者入力ポップアップ。
     紹介者を入力するまで閉じない（×・背景クリックでの閉じ不可）。
     開閉は $lib/referrer の referrerPromptOpen（initReferrer が立てる）。
     全ページ共通なので +layout.svelte で1つだけ描画する。 -->
<script lang="ts">
	import { referrerPromptOpen, saveReferrer, REFERRER_MAX_LENGTH } from '$lib/referrer';

	let referrerInput = '';
	const submitReferrer = () => saveReferrer(referrerInput);

	// モバイルでキーボード表示後に入力欄が隠れるため、見える位置までスクロールする。
	const scrollReferrerInputIntoView = (e: FocusEvent) => {
		const el = e.currentTarget as HTMLElement;
		// キーボードのせり上がりを待ってからスクロール。
		setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
	};
</script>

{#if $referrerPromptOpen}
	<!-- overflow-y-auto + min-h-full: モバイルでキーボード表示時に入力欄をスクロールで見られるようにする。 -->
	<div
		class="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
	>
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 text-center shadow-[0_24px_60px_rgba(38,16,31,0.3)]">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbeef3]">
					<span class="text-2xl text-[#d45588]" aria-hidden="true">🤝</span>
				</div>
				<h2 class="mt-5 text-xl text-[#2e1d24]">ご紹介者様のお名前</h2>
				<p class="mt-3 text-sm leading-7 text-[#5f4b53]">
					ご紹介いただいた方のお名前をご入力ください。
				</p>
				<input
					type="text"
					bind:value={referrerInput}
					maxlength={REFERRER_MAX_LENGTH}
					placeholder="例：山田 花子"
					on:keydown={(e) => e.key === 'Enter' && submitReferrer()}
					on:focus={scrollReferrerInputIntoView}
					class="mt-5 w-full rounded-xl border border-[#E6B9CE] bg-white px-4 py-3 text-center text-base text-[#4D2B3C] placeholder:text-[#BC9AAD] focus:border-[#D86A99] focus:outline-none focus:ring-2 focus:ring-[#F4B8D2]"
				/>
				<button
					class="mt-5 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72] disabled:cursor-not-allowed disabled:opacity-50"
					on:click={submitReferrer}
					disabled={!referrerInput.trim()}
				>
					確定して進む
				</button>
			</div>
		</div>
	</div>
{/if}
