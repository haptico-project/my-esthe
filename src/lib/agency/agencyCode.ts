import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { backendAccessor } from '$lib/backendAccessor';

export const agencyCode = writable<string | null>(null);

/**
 * クエリストリング優先、なければ sessionStorage
 */
export function initAgencyCode(): void {
	if (!browser) return;
	const url = get(page).url;
	const queryCode = url.searchParams.get('agencyCode') ?? '2139';
	const sessionCode = sessionStorage.getItem('agencyCode');

	if (queryCode) {
		// チェック
		backendAccessor(`/api/v1/shop/agency?code=${queryCode}`, {
			method: 'GET'
		})
			.then(() => {
				sessionStorage.setItem('agencyCode', queryCode);
				agencyCode.set(queryCode);
			})
			.catch(() => {
				alert('不正な店舗コードです。');
			});
	} else if (sessionCode) {
		agencyCode.set(sessionCode);
	}
}

/**
 * 任意の場所から設定する場合
 */
export function setAgencyCode(code: string): void {
	if (!browser) return;

	// チェック
	backendAccessor(`/api/v1/shop/agency?code=${code}`, {
		method: 'GET'
	})
		.then(() => {
			sessionStorage.setItem('agencyCode', code);
			agencyCode.set(code);
		})
		.catch(() => {
			alert('不正な代理店コードです。');
		});
}
