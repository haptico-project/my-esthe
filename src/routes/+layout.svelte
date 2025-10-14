<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
</script>

<div class="relative min-h-dvh font-sans text-ink">
	<!-- 背景（固定） -->
	<div
		class="fixed inset-0 -z-10 pointer-events-none bg-cover bg-center blur-md brightness-90"
		style={`background-image: url('${base}/images/bg.jpg');`}
	/>
	<div class="fixed inset-0 -z-10 bg-white/40 pointer-events-none" />

	<!-- コンテンツ -->
	<div
		class="
      /* ✅ モバイル: 幅制限なし・グリッドなし（＝フル幅） */
      /* ✅ PC: md以上でだけグリッド化＋最大幅制御 */
      md:mx-auto md:max-w-[1200px] md:px-6
      md:grid md:grid-cols-[1fr_min(100%,theme(maxWidth.phone))_1fr]
    "
	>
		<!-- 左右は md 未満で非表示 -->
		<aside class="hidden md:block"><slot name="left" /></aside>

		<!-- 中央。モバイルはフル幅、PCはスマホ幅に制限 -->
		<main class="w-full md:mx-auto md:max-w-phone">
			<slot />
		</main>

		<aside class="hidden md:block"><slot name="right" /></aside>
	</div>
</div>

