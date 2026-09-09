/**
 * サイト内行動の計測（Google Analytics 4 + Microsoft Clarity）。
 *
 * 目的は「Instagram 広告からの流入が、申込のどの段階で落ちているか」を段階別に見ること。
 * 計測する漏斗は次の 7 段:
 *   1. page_view        … ページ到達
 *   2. view_section     … 各セクションの閲覧到達（どこまで読まれたか）
 *   3. scroll_depth     … スクロール到達率 25/50/75/90/100%
 *   4. cta_click        … 申込ボタンのクリック（ヒーロー / 固定ヘッダー / 最下部）
 *   5. select_plan      … 申込モーダルでプランを選択（step1 → step2）
 *   6. begin_checkout   … 規約同意して決済ページへ遷移（step3 → Stripe）
 *   7. purchase         … 決済完了して戻ってきた（?checkout=success）
 *
 * ID は下の 2 定数だけを差し替えれば有効になる。未設定のあいだは何も送信しない
 * （タグだけ先に仕込んでおき、GA4 プロパティ作成後に ID を入れる運用）。
 */

// ===== 差し替えるのはここだけ =====================================================
// GA4 測定 ID: GA 管理 → データストリーム → ウェブ → 「測定 ID」（G-XXXXXXXXXX）
export const GA_MEASUREMENT_ID = 'G-RZZ9JEPWJN';
// Clarity プロジェクト ID: clarity.microsoft.com → Settings → Setup（10文字程度の英数字）
export const CLARITY_PROJECT_ID = '';
// =================================================================================

type Params = Record<string, string | number | boolean | undefined>;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		clarity?: (...args: unknown[]) => void;
	}
}

/** localhost / プレビューでは送信せずコンソールに出す（本番データを汚さず動作確認できる）。 */
const isDevHost = () =>
	typeof window !== 'undefined' &&
	/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

let initialized = false;

/** 全イベントに共通で付ける属性。広告流入の切り分けと、トップ / LP の比較に使う。 */
const commonParams = (): Params => {
	if (typeof window === 'undefined') return {};
	const path = window.location.pathname;
	let code = '';
	try {
		// 店舗コードは agencyCode.ts が sessionStorage に保存している。
		code = sessionStorage.getItem('agencyCode') ?? '';
	} catch {
		// ストレージが使えない環境でも計測は続ける。
	}
	return {
		// トップ（/）と Instagram 用 LP（/lp）を分けて集計するための軸
		page_kind: /(^|\/)lp(\/|$)/.test(path) ? 'lp' : 'top',
		// 店舗コード付きパス（/XXXX, /lp/XXXX）の識別
		agency_code: code
	};
};

/** イベント送信。GA4 に送りつつ、Clarity 側にも同名のタグを立てて録画の絞り込みに使えるようにする。 */
export const track = (eventName: string, params: Params = {}): void => {
	const payload = { ...commonParams(), ...params };

	if (isDevHost()) {
		console.log('[analytics]', eventName, payload);
		return;
	}
	window.gtag?.('event', eventName, payload);
	// Clarity のセッション録画を「CTAを押した人だけ」等で絞り込めるようにタグを付ける。
	window.clarity?.('event', eventName);
};

/** SPA 遷移時のページビュー。SvelteKit はページ遷移でスクリプトを再読込しないため手動で送る。 */
export const trackPageView = (url: URL): void => {
	if (isDevHost()) {
		console.log('[analytics] page_view', url.pathname + url.search);
		return;
	}
	window.gtag?.('event', 'page_view', {
		...commonParams(),
		page_location: url.href,
		page_path: url.pathname + url.search,
		page_title: document.title
	});
};

const loadScript = (src: string): void => {
	const el = document.createElement('script');
	el.async = true;
	el.src = src;
	document.head.appendChild(el);
};

/** 計測タグの読み込み。+layout.svelte の onMount から 1 回だけ呼ぶ。 */
export const initAnalytics = (): void => {
	if (initialized || typeof window === 'undefined') return;
	initialized = true;

	if (isDevHost()) {
		console.log('[analytics] dev host のため送信しません（イベントはコンソールに出力）');
		return;
	}

	if (GA_MEASUREMENT_ID) {
		window.dataLayer = window.dataLayer || [];
		window.gtag = function gtag() {
			// gtag は arguments をそのまま dataLayer に積む仕様のためアロー関数にできない。
			// eslint-disable-next-line prefer-rest-params
			window.dataLayer?.push(arguments);
		};
		window.gtag('js', new Date());
		// page_view は SPA 遷移ぶんを trackPageView で送るので自動送信は止める。
		window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
		loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
	}

	if (CLARITY_PROJECT_ID) {
		window.clarity =
			window.clarity ||
			function clarity() {
				// eslint-disable-next-line prefer-rest-params
				(window.clarity as unknown as { q: unknown[] }).q =
					(window.clarity as unknown as { q?: unknown[] }).q || [];
				(window.clarity as unknown as { q: unknown[] }).q.push(arguments);
			};
		loadScript(`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`);
	}
};

/**
 * ページ内の到達計測を開始する。
 *   - スクロール到達率（25/50/75/90/100%）
 *   - data-ga-section 属性を付けた要素の閲覧到達
 * 戻り値は解除関数（onMount の返り値にそのまま渡す）。
 */
export const initPageTracking = (): (() => void) => {
	if (typeof window === 'undefined') return () => {};

	// --- スクロール到達率 -------------------------------------------------------
	const thresholds = [25, 50, 75, 90, 100];
	const reached = new Set<number>();
	let ticking = false;

	const measure = () => {
		ticking = false;
		const scrollable = document.documentElement.scrollHeight - window.innerHeight;
		// スクロールしようがない短いページは 100% 扱いにせず無視する（水増し防止）。
		if (scrollable <= 0) return;
		const percent =
			((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
		for (const t of thresholds) {
			if (percent >= t && !reached.has(t)) {
				reached.add(t);
				track('scroll_depth', { percent: t });
			}
		}
	};
	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(measure);
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	// 初期表示ですでに見えている範囲も 1 度測る。
	requestAnimationFrame(measure);

	// --- セクション到達 ---------------------------------------------------------
	// 「どのセクションまで見られたか」を出すため、画面に半分以上入った時点で 1 回だけ送る。
	const seen = new Set<string>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const name = (entry.target as HTMLElement).dataset.gaSection;
				if (!name || seen.has(name)) continue;
				seen.add(name);
				observer.unobserve(entry.target);
				track('view_section', { section_name: name });
			}
		},
		{ threshold: 0.5 }
	);
	document.querySelectorAll<HTMLElement>('[data-ga-section]').forEach((el) => observer.observe(el));

	return () => {
		window.removeEventListener('scroll', onScroll);
		observer.disconnect();
	};
};

// ===== 申込フローの計測 ===========================================================

const PENDING_KEY = 'analytics:pending_checkout';

/** 決済ページへ送り出す直前の内容を控える。戻ってきた時に purchase の金額として使う。 */
export const rememberCheckout = (data: {
	planId: string;
	planName: string;
	value: number;
}): void => {
	try {
		sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, id: `w-${Date.now()}` }));
	} catch {
		// プライベートブラウズ等で sessionStorage が使えなくても計測以外に影響させない。
	}
};

/**
 * Stripe から戻ってきた時の結果を送る（?checkout=success | cancel）。
 * success は GA4 の推奨イベント purchase として送り、収益レポートに載るようにする。
 */
export const trackCheckoutResult = (result: 'success' | 'cancel'): void => {
	let pending: { id?: string; planId?: string; planName?: string; value?: number } = {};
	try {
		pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? '{}');
		sessionStorage.removeItem(PENDING_KEY);
	} catch {
		// 控えが無くても件数だけは計測できるようにする。
	}

	if (result === 'cancel') {
		track('checkout_cancel', { plan_id: pending.planId ?? '', plan_name: pending.planName ?? '' });
		return;
	}

	track('purchase', {
		transaction_id: pending.id ?? `w-${Date.now()}`,
		currency: 'JPY',
		value: pending.value ?? 0,
		plan_id: pending.planId ?? '',
		plan_name: pending.planName ?? ''
	});
};
