<!-- 決済・解約など、バックエンドから確認メールが送られる導線で「haptico.co.jp からメールが届く」旨を案内する小ダイアログ。
     決済3リポジトリ（my-esthe / wellbeing-room / wellbeing-room-pet）で共通利用する想定の自己完結コンポーネント。 -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = 'メール通知について';
	export let message = 'haptico.co.jp より、お手続きに関する通知メールをお送りします。';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');
</script>

{#if open}
	<div
		class="fixed inset-0 z-[70] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] p-4 backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 text-center shadow-[0_24px_60px_rgba(38,16,31,0.3)]"
		>
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbeef3]">
				<span class="text-3xl text-[#d45588]" aria-hidden="true">✉</span>
			</div>
			<h2 class="mt-5 text-xl text-[#2e1d24]">{title}</h2>
			<p class="mt-4 whitespace-pre-line text-sm leading-7 text-[#5f4b53]">{message}</p>
			<button
				class="mt-6 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72]"
				on:click={close}
			>
				閉じる
			</button>
		</div>
	</div>
{/if}
