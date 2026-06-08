import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * 適用するクーポンID（キャンペーンURL `?coupon=xxx` 経由）。
 * Stripe 側で有効性・有効期限(redeem_by)が検証されるため、フロントでは事前検証しない。
 */
export const coupon = writable<string | null>(null);

/**
 * クーポンIDを解決する。クエリ `?coupon=` 優先、なければ sessionStorage。
 * 一度踏めば回遊中は保持する（agencyCode と同様）。
 */
export function initCoupon(): void {
	if (!browser) return;
	const queryCoupon = get(page).url.searchParams.get('coupon');
	const sessionCoupon = sessionStorage.getItem('coupon');

	if (queryCoupon) {
		sessionStorage.setItem('coupon', queryCoupon);
		coupon.set(queryCoupon);
	} else if (sessionCoupon) {
		coupon.set(sessionCoupon);
	}
}
