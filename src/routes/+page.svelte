<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="relative flex items-center justify-center w-screen h-[100dvh] overflow-hidden">
	<!-- 背景 -->
	<img
		src={`${base}/images/my-main.png`}
		alt=""
		class="absolute inset-0 w-full h-full object-cover blur-2xl brightness-90 -z-20 select-none pointer-events-none"
	/>

	<!-- メイン画像 + コンテンツ -->
	<div class="relative max-w-full max-h-full flex items-center justify-center z-0">
		<!-- 画像（触らない） -->
		<img
			src={`${base}/images/my-main.png`}
			alt=""
			class="max-w-full max-h-[100dvh] object-contain select-none pointer-events-none"
		/>

		<!-- オーバーレイ（全面）→ 触らせない -->
		<div class="absolute inset-0 z-10 pointer-events-none">
			<!-- 左上ロゴ（装飾） -->
			<img
				src={`${base}/images/logo.png`}
				alt="logo"
				class="absolute"
				style="
          top: max(16px, env(safe-area-inset-top));
          left: max(16px, env(safe-area-inset-left));
          width: min(64px, 200px);
          height: auto;
        "
			/>

			<!-- 左下画像（装飾） -->
			<img
				src={`${base}/images/plan.png`}
				alt="badge"
				class="absolute"
				style="
          left: max(16px, env(safe-area-inset-left));
          bottom: max(16px, env(safe-area-inset-bottom));
          width: min(42vw, 260px);
          height: auto;
        "
			/>

			<!-- 右側テキスト群（ここもデフォは触らせない） -->
			<div class="absolute inset-0 flex flex-col justify-center text-white mr-8 items-end z-20">
				<img src={`${base}/images/catch.png`} alt="" class="max-w-[38%] max-h-[160px]" />
				<img src={`${base}/images/parts/line.png`} alt="" class="max-w-[38%] mt-4" />
				<div class="max-w-[38%] mt-2">
          <span style="font-family: hiragino-mincho-pro; color: #FC78A2; font-size: 16px;">
            実はエステは毎日必要
          </span>
				</div>

				<!-- ✅ ボタンだけクリック可にする -->
				<button
					class="relative z-30 w-[38%] px-3 py-3 rounded-lg shadow hover:bg-[#F242] transition mt-2 pointer-events-auto"
					on:click={() => alert('準備中です。')}
				>
          <span
						class="font-bold"
						style="color: #434343; font-size: 14px; font-family: 'hiragino-mincho-pro';"
					>
            今すぐ始める
          </span>
				</button>
			</div>
		</div>

		<!-- フッター：全面を覆わない or 触らせない -->
		<footer class="absolute right-4 bottom-2 text-white z-0 pointer-events-none">
      <span style="color: #434343; font-size: 12px; font-family: 'hiragino-mincho-pro';">
        Facetherapie, Inc.
      </span>
		</footer>
	</div>
</div>
