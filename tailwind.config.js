export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif']
			},
			colors: {
				basebg: '#EBEBE8', // 全体背景
				basegrad: '#FFFFFF', // グラデーション終点
				ink: '#5E5E5E', // 文字色
				relax: '#FF91C0', // 見出し・波線
				relaxbg: '#FFF1F7', // 「猫と一緒にリラックス」背景
				cta: '#FFDFED' // 購入ボタン
			},
			maxWidth: {
				phone: '480px' // 中央“スマホ幅”（任意で390/414等へ）
			}
		}
	},
	plugins: []
};
