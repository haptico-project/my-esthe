<script>
	import { base } from '$app/paths';
	import ImageAt from '../infras/ImageAt.svelte';
	import HeroBoard from '../infras/HeroBoard.svelte';

	const shops = [
		{
			name: "加賀スポーツ株式会社",
			addr: "〒101-0023 東京都千代田区神田松永町20番地 加賀電子本社ビル 4F",
			tel: "03-5657-0148",
			mail: "t_ikeda@fyt.co.jp"
		},
		{
			name: "株式会社ラビータ",
			addr: "171-8569 東京都豊島区南池袋 株式会社 西武百貨店 池袋店",
			tel: "03-6812-1717"
		},
		{
			name: "アクティブAKIBA",
			addr: "〒101-0028 東京都千代田区神田花岡町1-1 ヨドバシAKIBA9階",
			tel: "03-5209-1701"
		},
		{
			name: "株式会社ファセテラピー",
			addr: "112-0002 東京都文京区小石川2-3-4 第一川田ビル2階",
			tel: "03-3818-0408"
		}
	];

</script>

<section class="text-center relative" style="background-color: #EBEBE8;">

	<!-- 固定アスペクトの盤面にヒーロー画像とオーバーレイを重ねる -->
	<HeroBoard src={`${base}/images/cat-main.png`} designW={428} designH={926}>

		<!-- ロゴ（右上に重ねる） -->
		<div class="absolute top-3 right-3">
			<img src={`${base}/images/logo.png`} alt="logo" class="h-8 w-[70px] h-[70px]" />
		</div>

		<!-- 見出し（盤面比で固定位置に） -->
		<div class="absolute right-1" style="top: 85%;">
			<span class="-translate-x-1/2 text-[30px] font-bold">一緒に、エステ。</span>
		</div>

	</HeroBoard>

	<!-- 購入ボタン（盤面内の%座標。端末が変わっても位置がブレない） -->
	<div class="relative -mt-4 flex justify-center">
		<ImageAt
			class="pressable pressable-glow"
			href="#"
			src={`${base}/images/shop-btn.svg`}
			width="40%"
			x={75}
			y={95}
		/>
	</div>

	<!-- 下部テキスト（ヒーローの下に続く） -->
	<section class="relative px-6 pt-8" style="margin-top: 6rem;">
		<div class="text-center text-ink">
			「わたしのエステ」は、<br />
			熟練マッサージ師の手の動きを再現した振動器です。<br />
			やわらかな振動が、<br />
			心と体を静かにゆるめていきます。<br />
			<br />

			そして、<br />
			この振動器のいちばんの魅力は<br />
			猫と一緒に使えること。<br />
			通常の振動モードにくわえて、<br />
			猫の小さな体にもやさしい、穏やかなモードが選べます。<br />
			<br />
			猫がゴロゴロと喉を鳴らし、<br />
			私も目を閉じて、夢の中へ...<br />
			<br />
			猫と一緒に、やさしく癒される。<br />
			そんな、日常に小さな贅沢を添える<br />
			新しいエステ体験をお楽しみください。<br />
		</div>

		<div class="text-center text-ink mx-4" style="margin-top: 6rem; margin-bottom: 6rem;">
			<video class="mx-auto" controls autoplay loop muted playsinline>
				<source src={`${base}/videos/catme-esthe.mp4`} type="video/mp4">
				お使いのブラウザは動画再生に対応していません。
			</video>
		</div>
	</section>

	<!-- LINE UP -->
	<section class="relative pt-8" style="margin-top: 2rem; background-color: #FFF0">
		<div class="overflow-hidden">
			<img src={`${base}/images/parts/section-div3.svg`} class="block w-full h-auto -mb-px" alt="section-div1"/>
		</div>
		<div class="text-center text-ink" style="font-size: 24px; background-color: #FFF">
			<div style="line-height: 1em;">
				<span style="font-size: 28px;"><u>LINE UP</u></span><br/>
				<span style="font-size: 14px;">ラインナップ</span>
			</div>
			<img class="p-8" src={`${base}/images/products/one.png`} alt="product"/>
		</div>

		<div class="text-left mt-4 mx-6 pb-4">

		</div>
	</section>

	<!-- Usecase -->
	<section class="relative" style="padding-top: 6rem; margin-top: -4rem; background-color: #FFF">

		<div class="overflow-hidden">
			<img src={`${base}/images/parts/section-div1.svg`} class="block w-full h-auto -mb-px" alt="section-div1"/>
		</div>
		<div style="background-color: #FFF1F7">

			<div class="text-center text-ink pt-12 px-4" style="font-size: 17px;">
				わたしの、まったり癒しタイムを。<br/>
				全身どこでも、好きな場所にお使いいただけます。
				<img class="mt-4" src={`${base}/images/parts/under-wave.svg`} alt="under-wave"/>
			</div>

			<div class="text-left mt-12 mx-6 pb-12">
				<div>◎ 一緒にヘッドスパ</div>
				<div class="grid grid-cols-2 grid-rows-1 gap-4">
					<div class="">
						<img src={`${base}/images/section-case/いっしょにヘッドスパ_ねこ.png`} alt="section-div"/>
					</div>
					<div class="">
						<img src={`${base}/images/section-case/いっしょにヘッドスパ_人.png`} alt="section-div"/>
					</div>
				</div>

				<div class="mt-8">◎ 一緒に腸活</div>
				<div class="grid grid-cols-2 grid-rows-1 gap-4">
					<div class="">
						<img src={`${base}/images/section-case/いっしょに腸活_人.png`} alt="section-div"/>
					</div>
					<div class="">
						<img src={`${base}/images/section-case/いっしょに腸活_猫.png`} alt="section-div"/>
					</div>
				</div>
			</div>
		</div>

		<div style="background-color: #EBEBE8">
			<img src={`${base}/images/parts/section-div2.svg`} alt="section-div2"/>
		</div>
	</section>

	<!-- 販売店舗 -->
	<section class="relative px-6 pt-8" style="margin-top: 2rem;">
		<div class="text-center text-ink" style="font-size: 24px;">
			販売店舗
			<img class="mt-4" src={`${base}/images/parts/simple-border.svg`} alt="border"/>
		</div>

		<div class="text-left mt-4 mx-6 pb-4">
			<div class="grid grid-cols-2 gap-y-4 gap-x-8 text-left text-sm">
				{#each shops as shop}
					<div>
						<p class="font-medium">{shop.name}</p>
						<p>{shop.addr}</p>
						{#if shop.tel}
							<p>TEL: {shop.tel}</p>
						{/if}
						{#if shop.mail}
							<p>{shop.mail}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<div class="text-center text-ink" style="font-size: 24px;">
			<img  src={`${base}/images/parts/simple-border.svg`} alt="border"/>
		</div>
	</section>
	<div class="h-10"></div>

	<footer style="margin-top: 10rem; padding-bottom: 1rem;">
		&copy; 2025 Facetherapie Inc.
	</footer>
</section>

<style type="text/css">

</style>
