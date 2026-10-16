import { describe, expect, it } from 'vitest';
import { discountedPrice } from './coupon';

describe('discountedPrice', () => {
	it('有効な定額クーポンは Stripe の amount_off を引く', () => {
		expect(discountedPrice({ valid: true, discount: { amountOff: 2200, percentOff: null } }, 5500)).toBe(3300);
	});

	it('有効な率クーポンは percent_off で割り引く', () => {
		expect(discountedPrice({ valid: true, discount: { amountOff: null, percentOff: 40 } }, 5500)).toBe(3300);
	});

	it('未確認・無効・割引内容なしは定価のまま（誤った割引表示を出さない）', () => {
		const amount = { amountOff: 2200, percentOff: null };
		expect(discountedPrice({ valid: null, discount: amount }, 5500)).toBe(5500);
		expect(discountedPrice({ valid: false, discount: null }, 5500)).toBe(5500);
		expect(discountedPrice({ valid: true, discount: { amountOff: null, percentOff: null } }, 5500)).toBe(5500);
	});
});
