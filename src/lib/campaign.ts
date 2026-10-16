import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * キャンペーン識別子（キャンペーンURL `?campaign=xxx` 経由。例: salon2026）。
 * チェックアウト時に Stripe metadata `campaign` として保持され、どのキャンペーン経由の申込かを後から追える。
 */
export const campaign = writable<string | null>(null);

/** 入力値の上限（バックエンドの保存上限と揃える）。 */
const CAMPAIGN_MAX_LENGTH = 50;

/**
 * キャンペーンを解決する。クエリ `?campaign=` 優先、なければ sessionStorage。
 * 一度踏めば回遊中は保持する（coupon と同様）。
 */
export function initCampaign(): void {
	if (!browser) return;
	const queryCampaign = get(page).url.searchParams.get('campaign')?.trim().slice(0, CAMPAIGN_MAX_LENGTH);
	const sessionCampaign = sessionStorage.getItem('campaign');

	if (queryCampaign) {
		sessionStorage.setItem('campaign', queryCampaign);
		campaign.set(queryCampaign);
	} else if (sessionCampaign) {
		campaign.set(sessionCampaign);
	}
}
