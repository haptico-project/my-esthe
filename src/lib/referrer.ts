import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * 紹介者（チェックアウト時に Stripe metadata `referred_by` として保持される）。
 * メモリのみで保持し、永続化しない（ページを開き直す＝次回アクセスでは消える）。
 * 値はチェックアウトに進むまで有効。
 */
export const referrer = writable<string | null>(null);

/** 紹介者入力ポップアップの表示状態。`?ref` 付きで来訪したら必ず true。 */
export const referrerPromptOpen = writable<boolean>(false);

/** 入力値の上限（バックエンドの保存上限と揃える）。 */
export const REFERRER_MAX_LENGTH = 50;

/**
 * `?ref` 付きでアクセスした場合は、前回値に関わらず必ず入力ポップアップを開く。
 * 永続化はしないため、毎回の来訪で入力を求める。
 */
export function initReferrer(): void {
	if (!browser) return;
	if (get(page).url.searchParams.has('ref')) {
		referrer.set(null);
		referrerPromptOpen.set(true);
	}
}

/** 入力された紹介者を（メモリのみ）保持し、ポップアップを閉じる。空文字は無視。 */
export function saveReferrer(value: string): void {
	const v = value.trim().slice(0, REFERRER_MAX_LENGTH);
	if (!v) return;
	referrer.set(v);
	referrerPromptOpen.set(false);
}
