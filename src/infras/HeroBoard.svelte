<script lang="ts">
	export let src: string;          // 背景画像（ヒーロー）
	export let designW = 428;        // デザイン想定の横幅
	export let designH = 926;        // デザイン想定の縦幅
</script>

<div class="relative w-full overflow-hidden" style={`aspect-ratio:${designW}/${designH};`}>
	<img src={src} alt="" class="absolute inset-0 w-full h-full object-cover" />
	<slot />
</div>
