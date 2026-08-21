import { writable } from 'svelte/store';

/**
 * 「ペット用と、ひと専用の違い」説明ダイアログの開閉状態。
 * ペット導線（固定ヘッダー / LP下部 / 申込モーダル）の「？」ボタンから開く。
 * ダイアログ本体は +layout.svelte で1つだけ描画する。
 */
export const petDiffOpen = writable(false);
