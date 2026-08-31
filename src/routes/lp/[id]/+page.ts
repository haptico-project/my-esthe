// 店舗コード付きパス（/lp/XXXX）はクライアント側でのリダイレクト専用。
// 静的ビルド時に列挙できないため事前レンダリングせず、404.html（SPA フォールバック）に任せる。
export const prerender = false;
