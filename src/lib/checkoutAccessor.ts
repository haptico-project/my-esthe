import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_CHECKOUT_BASE_URL || 'https://payflow-backend.fly.dev';

const axiosInstance: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

export async function postCheckout<TRequest extends object, TResponse = any>(
	path: string,
	payload: TRequest
): Promise<TResponse> {
	try {
		const response = await axiosInstance.post<TRequest, { data: TResponse }>(path, payload, {
			validateStatus: (status) => status < 400 // ← 3xx も成功として扱う
		});

		return response.data;
	} catch (error: any) {
		// エラーハンドリング
		const msg = error?.response?.data?.message || error.message || 'Unknown error';
		throw new Error(`Checkoutリクエスト失敗: ${msg}`);
	}
}
