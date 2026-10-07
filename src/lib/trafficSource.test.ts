import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: false }));

const { buildTrafficSource } = await import('./trafficSource');

describe('buildTrafficSource', () => {
	it('UTM・外部参照元・入口パスを並べる', () => {
		const url = new URL('https://my-esthe.example/lp/8289?utm_source=instagram&utm_medium=bio');
		expect(buildTrafficSource(url, 'https://l.instagram.com/?u=https%3A%2F%2Fsecret')).toBe(
			'utm_source=instagram, utm_medium=bio, referrer=l.instagram.com, landing=/lp/8289'
		);
	});

	it('広告クリックIDは値を残さず有無だけ残す', () => {
		const url = new URL('https://my-esthe.example/lp?fbclid=SECRET123&igsh=abc');
		const result = buildTrafficSource(url, '');
		expect(result).toBe('click=fbclid+igsh, landing=/lp');
		expect(result).not.toContain('SECRET123');
	});

	it('自サイト・Stripe からの参照元は流入元にしない（UTM も無ければ direct）', () => {
		const url = new URL('https://my-esthe.example/');
		expect(buildTrafficSource(url, 'https://my-esthe.example/lp')).toBe('direct, landing=/');
		expect(buildTrafficSource(url, 'https://checkout.stripe.com/c/pay/cs_1')).toBe(
			'direct, landing=/'
		);
	});

	it('UTM 値は長さを切り詰める', () => {
		const url = new URL(`https://my-esthe.example/?utm_campaign=${'a'.repeat(300)}`);
		expect(buildTrafficSource(url, '')).toBe(`utm_campaign=${'a'.repeat(100)}, landing=/`);
	});
});
