<!-- グループサイトへの「関連リンク」。
     店舗コード対応サイトへは、現在の $agencyCode を遷移先が受け付ける書式
     （query: ?agencyCode= / querySnake: ?agency_code= / path: /コード）で引き継ぐ。
     一覧・書式のマスターは README「関連リンク一覧」を参照（更新時は両方直す）。 -->
<script lang="ts">
	import { agencyCode } from '$lib/agency/agencyCode';

	type CodeStyle = 'query' | 'querySnake' | 'path';
	type RelatedLink = { label: string; url: string; code?: CodeStyle };
	type Group = { title: string; links: RelatedLink[] };

	const groups: Group[] = [
		{
			title: 'サービス',
			links: [
				{ label: '美容ai.com', url: 'https://美容ai.com/' },
				{ label: 'Dr.AI', url: 'https://dr-ai.health/', code: 'query' },
				{ label: 'Wellbeing Room', url: 'https://wellbeingroom.tokyo/', code: 'query' },
				{ label: '顔リズム', url: 'https://顔リズム.com/' }
			]
		},
		{
			title: 'ペット',
			links: [
				{ label: 'ペットウェルネス', url: 'https://pet.wellbeingroom.tokyo/', code: 'path' }
			]
		},
		{
			title: 'ショップ・スクール',
			links: [
				{ label: '公式ショップ', url: 'https://facetherapie.shop/', code: 'query' },
				{ label: 'スクール', url: 'https://tokyo-ft.com/' }
			]
		},
		{
			title: '会社',
			links: [{ label: 'ファセテラピー', url: 'https://facetherapie.com/' }]
		}
	];

	function href(link: RelatedLink, code: string | null): string {
		if (!link.code || !code) return link.url;
		if (link.code === 'path') return `${link.url}${encodeURIComponent(code)}`;
		const key = link.code === 'querySnake' ? 'agency_code' : 'agencyCode';
		return `${link.url}?${key}=${encodeURIComponent(code)}`;
	}
</script>

<div class="mt-10 border-t border-gray-100 pt-6">
	<p class="mb-4 text-[11px] tracking-[0.25em] text-gray-400">関連リンク</p>
	<div class="flex flex-col gap-4">
		{#each groups as group (group.title)}
			<div>
				<p class="mb-1 text-[10px] tracking-widest text-gray-300">{group.title}</p>
				<div class="flex flex-wrap justify-center gap-x-4 gap-y-1">
					{#each group.links as link (link.url)}
						<a
							href={href(link, $agencyCode)}
							target="_blank"
							rel="noopener"
							class="text-xs text-gray-500 transition-colors hover:text-gray-800"
						>
							{link.label}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
