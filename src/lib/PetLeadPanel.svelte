<!-- ペット導線の展開パネル。
     「ペットと一緒に使いたい方はこちら」を押した際に、リンク直行ではなく
     「人にもペットにも同じ振動器」の説明を先に見せる（初見の広告流入ユーザー向け）。
     [詳しく見る] は既存の比較表ダイアログ（petDiffOpen）を開き、
     ペット向けページへは明示的なボタンで遷移する。 -->
<script lang="ts">
	import { petDiffOpen } from '$lib/petDiff';

	export let petPageUrl: string;
</script>

<div
	class="rounded-2xl border border-[#f0dbe3] bg-white/95 p-5 text-left shadow-[0_10px_30px_rgba(38,16,31,0.14)]"
	style="font-family: 'Hiragino Mincho Pro', 'Hiragino Mincho ProN', 'Yu Mincho', serif;"
>
	<p class="text-sm leading-7 text-[#4d3b43]">
		人にもペットにも、同じ振動器をお使いいただけます。<br />
		使うときは、用途に合わせて振動モードを選ぶだけ。
	</p>
	<div class="mt-4 flex flex-col gap-2.5 sm:flex-row">
		<button
			type="button"
			class="flex-1 rounded-full border border-[#d7a8bd] bg-white px-4 py-2.5 text-sm text-[#b8437a] transition hover:bg-[#fbeef3]"
			on:click={() => petDiffOpen.set(true)}
		>
			詳しく見る
		</button>
		<a
			href={petPageUrl}
			class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d45588] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#be3d72]"
		>
			🐾 ペット向けページへ
			<span aria-hidden="true">→</span>
		</a>
	</div>
</div>
