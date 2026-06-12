import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * 紹介者（チェックアウト時に Stripe metadata `referred_by` として保持される）。
 * 紹介用URL `?ref` を踏んだ場合、入力されるまでポップアップで入力を促す。
 */
export const referrer = writable<string | null>(null);

/** 紹介者入力ポップアップの表示状態。`?ref` 付きで来訪し未入力のとき true。 */
export const referrerPromptOpen = writable<boolean>(false);

/** 入力値の上限（バックエンドの保存上限と揃える）。 */
export const REFERRER_MAX_LENGTH = 50;

/**
 * 紹介者を解決する。すでに入力済み(sessionStorage)ならそれを採用。
 * 未入力で `?ref` フラグ付きなら、入力ポップアップを開く。
 */
export function initReferrer(): void {
	if (!browser) return;
	const stored = sessionStorage.getItem('referrer');
	if (stored) {
		referrer.set(stored);
		return;
	}
	if (get(page).url.searchParams.has('ref')) {
		referrerPromptOpen.set(true);
	}
}

/** 入力された紹介者を保存し、ポップアップを閉じる。空文字は無視。 */
export function saveReferrer(value: string): void {
	const v = value.trim().slice(0, REFERRER_MAX_LENGTH);
	if (!v) return;
	if (browser) sessionStorage.setItem('referrer', v);
	referrer.set(v);
	referrerPromptOpen.set(false);
}
