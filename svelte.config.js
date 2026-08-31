import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProdPages = process.env.DEPLOY_TARGET === 'gh-pages';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			// GitHub Pages では存在しないパスに 404.html が返る。これを SPA フォールバックにして、
			// 店舗コード付きパス（/XXXX, /lp/XXXX）をクライアント側でルーティングできるようにする。
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: isProdPages ? '/my-esthe' : ''
		}
		// paths: {
		// 	base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		// }
	}
};

export default config;
