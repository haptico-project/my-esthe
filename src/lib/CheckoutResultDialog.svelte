<!-- Stripe 決済からの戻り（?checkout=success | cancel）を検知して、完了/未完了の案内を出す。
     「完了したか分からず再申込」を防ぐため、戻り後は必ず結果を提示する。
     全ページ共通なので +layout.svelte で1つだけ描画する。 -->
<script lang="ts">
	import { onMount } from 'svelte';

	// null=通常表示, 'success'=お申し込み完了, 'cancel'=未完了。
	let checkoutResult: 'success' | 'cancel' | null = null;

	onMount(() => {
		const params = new URL(window.location.href).searchParams;
		const result = params.get('checkout');
		if (result === 'success' || result === 'cancel') {
			checkoutResult = result;
			// 目印は消す（リロードでの再表示・URL汚染・SNS共有時の流出を防ぐ）。
			const url = new URL(window.location.href);
			url.searchParams.delete('checkout');
			window.history.replaceState({}, '', url.toString());
		}
	});

	const close = () => (checkoutResult = null);
</script>

{#if checkoutResult}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] p-4 backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
	>
		<div class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 text-center shadow-[0_24px_60px_rgba(38,16,31,0.3)]">
			{#if checkoutResult === 'success'}
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbeef3]">
					<span class="text-3xl text-[#d45588]" aria-hidden="true">✓</span>
				</div>
				<h2 class="mt-5 text-2xl text-[#2e1d24]">お申し込みが完了しました</h2>
				<p class="mt-4 text-sm leading-7 text-[#5f4b53]">
					ご決済が完了し、お申し込みを受け付けました。<br />
					<span class="font-semibold text-[#c15582]">重ねてお申し込みいただく必要はございません。</span>
				</p>
				<p class="mt-4 rounded-xl bg-[#fbeef3] px-4 py-3 text-xs leading-6 text-[#8a5a72]">
					✉ <span class="font-semibold">haptico.co.jp</span> より、お申し込みに関する通知メールをお送りします。
				</p>
				<button
					class="mt-6 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72]"
					on:click={close}
				>
					閉じる
				</button>
			{:else}
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3eef0]">
					<span class="text-3xl text-[#9a7d88]" aria-hidden="true">！</span>
				</div>
				<h2 class="mt-5 text-2xl text-[#2e1d24]">お申し込みは完了していません</h2>
				<p class="mt-4 text-sm leading-7 text-[#5f4b53]">
					決済が完了しませんでした。お手数ですが、もう一度お試しください。
				</p>
				<button
					class="mt-6 w-full rounded-full bg-[#26202a] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#171317]"
					on:click={close}
				>
					閉じる
				</button>
			{/if}
		</div>
	</div>
{/if}
