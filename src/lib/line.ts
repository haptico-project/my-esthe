import { derived } from 'svelte/store';
import { agencyCode } from '$lib/agency/agencyCode';

/** 公式LINE（友だち登録・問い合わせ窓口）の LIFF。 */
export const LINE_LIFF_URL = 'https://liff.line.me/2007233135-vxLAjokB';

/** 店舗コードを shopCode として付けた公式LINE のリンク。店舗コード未取得なら素の LIFF。 */
export const lineUrl = derived(agencyCode, ($code) =>
	$code ? `${LINE_LIFF_URL}?shopCode=${encodeURIComponent($code)}` : LINE_LIFF_URL
);
