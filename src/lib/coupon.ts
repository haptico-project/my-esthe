import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { postCheckout } from '$lib/checkoutAccessor';

/**
 * 適用するクーポンID（キャンペーンURL `?coupon=xxx` 経由）。
 * 有効性と割引内容は validateCoupon() でバックエンド（Stripe）に問い合わせる。
 */
export const coupon = writable<string | null>(null);

/** キャンペーンクーポンの対象プラン（顔マスク付プラン）。クーポンは全体割引なので、対象外プランへは渡さない。 */
export const CAMPAIGN_PLAN_ID = 'face-mask-plan';
/** 顔マスク付プランの注文商品（振動器 + 顔マスク）。クーポンの所在アカウント解決にも使う。 */
export const CAMPAIGN_PLAN_PRODUCTS = [
	{ productId: 'price_1SUdstPo9yD7PttV1EclsBsi', quantity: 1 },
	{ productId: 'price_1T94CTPo9yD7PttVbiyOrzT2', quantity: 1 }
];

type CouponDiscount = { amountOff: number | null; percentOff: number | null };

/**
 * クーポンの判定結果。valid: null=未確認/判定不能, true=有効, false=無効。
 * discount は有効時のみ。割引額は Stripe のクーポンの値をそのまま使い、表示と請求をずらさない。
 */
export const couponCheck = writable<{ valid: boolean | null; discount: CouponDiscount | null }>({
	valid: null,
	discount: null
});

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

/** 保持中のクーポンをバックエンドで判定し、couponCheck に反映する。+layout の onMount から 1 回呼ぶ。 */
export async function validateCoupon(): Promise<void> {
	const code = get(coupon);
	if (!code) return;
	try {
		const res = await postCheckout<
			{ couponId: string; orderProducts: typeof CAMPAIGN_PLAN_PRODUCTS },
			{ valid: boolean; reason: string; amountOff?: number | null; percentOff?: number | null }
		>('/api/v1/checkout/coupon-validate', { couponId: code, orderProducts: CAMPAIGN_PLAN_PRODUCTS });
		if (res && res.valid) {
			couponCheck.set({
				valid: true,
				discount: { amountOff: res.amountOff ?? null, percentOff: res.percentOff ?? null }
			});
		} else {
			// 無効と確定 → 割引を出さず、保管場所からも破棄する。
			invalidateCoupon();
		}
	} catch {
		// 判定不能（ネットワーク等）は割引を出さない（安全側）。クーポンは破棄しない。
		couponCheck.set({ valid: null, discount: null });
	}
}

/** 無効と判定されたクーポンを破棄し、無効表示に切り替える。 */
export function invalidateCoupon(): void {
	clearCoupon();
	couponCheck.set({ valid: false, discount: null });
}

/**
 * 対象プランの割引後の月額。クーポンが有効と確認できていなければ定価のまま。
 * 割引内容が取れない（旧バックエンド等）場合も定価にしておき、誤った割引表示を出さない。
 */
export function discountedPrice(
	check: { valid: boolean | null; discount: CouponDiscount | null },
	price: number
): number {
	const discount = check.valid === true ? check.discount : null;
	if (!discount) return price;
	if (discount.amountOff) return Math.max(0, price - discount.amountOff);
	if (discount.percentOff) return Math.max(0, Math.round(price * (1 - discount.percentOff / 100)));
	return price;
}

/**
 * 無効と判定されたクーポンを保管場所（sessionStorage）とストアから破棄する。
 */
export function clearCoupon(): void {
	if (browser) sessionStorage.removeItem('coupon');
	coupon.set(null);
}
