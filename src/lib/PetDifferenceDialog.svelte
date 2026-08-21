<!-- 「ペット用と、ひと専用の違い」説明ダイアログ。
     振動器本体は同一で、選べる振動モードの組み合わせだけが違う、という趣旨を比較表で伝える。
     開閉は $lib/petDiff の petDiffOpen ストア（各所の「？」ボタンが立てる）。 -->
<script lang="ts">
	import { petDiffOpen } from '$lib/petDiff';

	const close = () => petDiffOpen.set(false);
</script>

{#if $petDiffOpen}
	<div
		class="fixed inset-0 z-[70] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,205,224,0.5),rgba(19,12,18,0.9))] p-4 backdrop-blur-sm"
		style="font-family: 'Hiragino Mincho Pro', serif;"
		role="dialog"
		aria-modal="true"
		aria-labelledby="pet-diff-title"
	>
		<div
			class="relative w-full max-w-md rounded-3xl border border-[#f0dbe3] bg-white p-7 shadow-[0_24px_60px_rgba(38,16,31,0.3)]"
		>
			<h2 id="pet-diff-title" class="text-center text-xl text-[#2e1d24]">
				ペット用と、ひと専用の違い
			</h2>
			<p class="mt-4 text-center text-sm leading-7 text-[#5f4b53]">
				振動器本体は、どちらも同じものを使用しています。<br />
				違いは、選択できる2種類の振動モードです。
			</p>

			<div class="mt-5 overflow-hidden rounded-2xl border border-[#f0dbe3]">
				<table class="w-full text-center text-sm">
					<thead>
						<tr class="bg-[#fbeef3] text-[#c15582]">
							<th class="w-[26%] px-2 py-3 font-normal" aria-hidden="true"></th>
							<th class="px-2 py-3 font-semibold">ひと専用</th>
							<th class="border-l border-[#f0dbe3] px-2 py-3 font-semibold">ペット用</th>
						</tr>
					</thead>
					<tbody class="text-[#4d3b43]">
						<tr class="border-t border-[#f0dbe3]">
							<th class="bg-[#fffafc] px-2 py-3 text-xs font-normal text-[#8d6f79]">振動器本体</th>
							<td colspan="2" class="px-2 py-3">共通（同じ本体）</td>
						</tr>
						<tr class="border-t border-[#f0dbe3]">
							<th class="bg-[#fffafc] px-2 py-4 text-xs font-normal text-[#8d6f79]">振動モード</th>
							<td class="px-2 py-4 leading-7">
								顔用<br />
								<span class="text-xs text-[#c9a5b3]">⇕</span><br />
								身体用
							</td>
							<td class="border-l border-[#f0dbe3] px-2 py-4 leading-7">
								ペット用<br />
								<span class="text-xs text-[#c9a5b3]">⇕</span><br />
								顔用
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p class="mt-4 text-xs leading-6 text-[#8d6f79]">※顔用と身体用では、振動の強さが異なります。</p>
			<p class="mt-2 text-sm leading-7 text-[#5f4b53]">
				どちらのタイプをお使いいただいても問題ありませんので、用途に合わせてお選びいただけます。
			</p>

			<button
				class="mt-6 w-full rounded-full bg-[#d45588] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#be3d72]"
				on:click={close}
			>
				閉じる
			</button>
		</div>
	</div>
{/if}
