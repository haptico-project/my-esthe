import { browser } from '$app/environment';

/**
 * 流入元（どこから来た人の申込か）。チェックアウト時に Payflow へ送り、
 * Stripe metadata `traffic_source` として保持 → 内部通知メールの「流入元」欄に出る。
 *
 * - タブ内の最初の来訪（first-touch）で 1 回だけ記録する。サイト内遷移や Stripe からの戻りで上書きしない
 * - 参照元はホスト名のみ（URL のパス・クエリは個人情報が混ざり得るため残さない）
 * - 広告クリックID（fbclid 等）は値を残さず「付いていたか」だけ残す
 */

const STORAGE_KEY = 'trafficSource';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
// fbclid=Meta広告/リンク, igsh=Instagramの共有リンク, gclid=Google広告, ttclid=TikTok広告
const CLICK_ID_KEYS = ['fbclid', 'igsh', 'igshid', 'gclid', 'ttclid'] as const;
// 自サイトや決済ページから戻った時の参照元は流入元ではないので除く
const IGNORED_REFERRER_HOSTS = [/(^|\.)stripe\.com$/];
const VALUE_MAX_LENGTH = 100;

const clip = (value: string) => value.trim().slice(0, VALUE_MAX_LENGTH);

const referrerHost = (referrer: string, selfHost: string): string | null => {
	if (!referrer) return null;
	try {
		const host = new URL(referrer).hostname;
		if (!host || host === selfHost) return null;
		if (IGNORED_REFERRER_HOSTS.some((re) => re.test(host))) return null;
		return host;
	} catch {
		return null;
	}
};

/** 来訪 URL と document.referrer から流入元の文字列を組み立てる（純関数・テスト対象）。 */
export const buildTrafficSource = (url: URL, referrer: string): string => {
	const parts: string[] = [];
	for (const key of UTM_KEYS) {
		const value = url.searchParams.get(key);
		if (value && value.trim()) parts.push(`${key}=${clip(value)}`);
	}
	const host = referrerHost(referrer, url.hostname);
	if (host) parts.push(`referrer=${host}`);
	const clickIds = CLICK_ID_KEYS.filter((key) => url.searchParams.has(key));
	if (clickIds.length > 0) parts.push(`click=${clickIds.join('+')}`);
	// UTM も参照元も無い＝直接入力・ブックマーク・アプリ内ブラウザ（参照元が消える）等
	if (parts.length === 0) parts.push('direct');
	parts.push(`landing=${url.pathname}`);
	return parts.join(', ');
};

/** 初回来訪時に流入元を記録する。+layout.svelte の onMount から呼ぶ。 */
export function initTrafficSource(): void {
	if (!browser) return;
	try {
		if (sessionStorage.getItem(STORAGE_KEY)) return;
		const url = new URL(window.location.href);
		// Stripe からの戻り（?checkout=...）が最初のページになった場合は流入元として扱わない
		if (url.searchParams.has('checkout')) return;
		sessionStorage.setItem(STORAGE_KEY, buildTrafficSource(url, document.referrer));
	} catch {
		// ストレージが使えない環境でも申込は続けられるようにする
	}
}

/** チェックアウト時に送る流入元。記録が無ければ null。 */
export function getTrafficSource(): string | null {
	if (!browser) return null;
	try {
		return sessionStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}
