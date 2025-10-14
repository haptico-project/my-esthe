<script lang="ts">
	export let src: string;
	export let alt: string = '';
	export let x: number = 0;             // X座標（%/px の単位は unit で）
	export let y: number = 0;             // Y座標
	export let unit: 'px' | '%' = '%';
	export let width: string = 'auto';    // 例: "40%", "160px"
	export let height: string = 'auto';
	export let center: boolean = true;    // true: (x,y) を中心基準に
	export let zIndex: number = 10;
	export let href: string | null = null; // null ならリンクなし
	// $$restProps は宣言不要：Svelte が自動提供
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	href={href}
	{...$$restProps}
	class="absolute"
	style={`
    left:${x}${unit};
    top:${y}${unit};
    width:${width};
    height:${height};
    transform:${center ? "translate(-50%, -50%)" : "none"};
    z-index:${zIndex};
  `}
>
	<img
		src={src}
		alt={alt}
		class="w-full h-full object-contain pointer-events-none select-none"
	/>
</svelte:element>
