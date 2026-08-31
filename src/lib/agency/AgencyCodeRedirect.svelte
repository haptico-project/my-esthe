<!-- 店舗コードをパスで受ける入口（/XXXX, /lp/XXXX）の共通処理。
     `to` で指定したページへ `?agencyCode=XXXX` を付けて送る。
     店舗コードの初期化（initAgencyCode）はページ読み込み時に1回だけ走る設計のため、
     goto（クライアント内遷移）ではなく location.replace でフル遷移させ、
     遷移先で確実に店舗コードが取り込まれるようにする。 -->
<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	/** 店舗コードを引き継いで表示するページのパス（例: '/', '/lp'） */
	export let to = '/';

	onMount(() => {
		const id = $page.params.id;
		if (!id) return;
		window.location.replace(`${base}${to}?agencyCode=${encodeURIComponent(id)}`);
	});
</script>

<p>リダイレクト中...</p>
