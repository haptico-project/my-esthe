import { writable } from 'svelte/store';

/**
 * 申込モーダル（infras/ModalFlow）の開閉状態。
 * 本体は +layout.svelte で1つだけ描画し、各ページ・ヘッダーの申込ボタンは
 * このストアを立てるだけにする（トップ / Instagram LP / ヘッダーで同じモーダルを共有）。
 */
export const applyModalOpen = writable(false);

export const openApplyModal = (): void => applyModalOpen.set(true);
export const closeApplyModal = (): void => applyModalOpen.set(false);
