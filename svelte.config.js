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
			fallback: undefined,
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
