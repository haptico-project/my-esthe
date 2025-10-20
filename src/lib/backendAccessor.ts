// src/lib/utils/backendAccessor.ts

const BASE_URL = 'https://payflow-backend.fly.dev'; // ✅ ベースURLを決め打ち

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface BackendOptions {
	method?: RequestMethod;
	headers?: Record<string, string>;
	body?: any;
	queryParams?: Record<string, string | number>;
	skipJsonParse?: boolean;
}

/**
 * 共通バックエンドアクセス関数
 */
export async function backendAccessor(path: string, options: BackendOptions = {}): Promise<any> {
	const { method = 'GET', headers = {}, body, queryParams, skipJsonParse = false } = options;

	let url = `${BASE_URL}${path}`;

	// ✅ クエリパラメータがあれば付与
	if (queryParams) {
		const params = new URLSearchParams();
		for (const key in queryParams) {
			params.append(key, String(queryParams[key]));
		}
		url += `?${params.toString()}`;
	}

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		...(body && { body: JSON.stringify(body) })
	});

	if (!res.ok) {
		const errorMessage = skipJsonParse ? res.statusText : (await res.json()).message;
		throw new Error(errorMessage || `Request failed with status ${res.status}`);
	}

	return res;
}
