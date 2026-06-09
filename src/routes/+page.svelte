<script lang="ts">
	import { base } from '$app/paths';
	import HeroBoard from '../infras/HeroBoard.svelte';
	import ModalFlow from '../infras/ModalFlow.svelte';
	import { agencyCode } from '$lib/agency/agencyCode';

	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import 'swiper/css';
	import { Pagination } from 'swiper';
	import 'swiper/css/pagination';

	let showModal = false;

	// ペット向けページへの導線。店舗コード（agencyCode）を引き継いで遷移する。
	$: petPageUrl = `https://pet.wellbeingroom.tokyo/${$agencyCode ?? ''}`;

	// 解約はメールでの受付を第一とする。メーラーに必要項目のテンプレートを差し込む。
	const cancelMailAddress = 'tft.kao@gmail.com';
	const cancelSubject = 'わたしのエステ 解約のお申し込み';
	const cancelBody = [
		'下記をご記入のうえ、そのまま送信してください。',
		'',
		'■ お名前：',
		'■ お電話番号：',
		'■ ご契約メールアドレス：',
		'■ 集荷先ご住所（レンタル品の返却用／レンタル品がある場合）：',
		'　〒',
		'　',
		'',
		'※ レンタル品の返却が必要な場合は、追って集荷のご案内をいたします。'
	].join('\n');
	const cancelMailto = `mailto:${cancelMailAddress}?subject=${encodeURIComponent(
		cancelSubject
	)}&body=${encodeURIComponent(cancelBody)}`;
</script>

<section
	class="text-center relative"
	style="background-color:#fff;font-family:'Hiragino Mincho Pro',serif;"
>

	<!-- ================= ペット導線（最上部・みずみずしいラベル） ================= -->
	<a
		href={petPageUrl}
		class="pet-bar group relative flex w-full items-center justify-center gap-2 overflow-hidden px-4 py-3 text-sm font-bold text-white sm:text-base"
	>
		<span class="pet-bar__label relative z-10 flex items-center gap-2">
			<span aria-hidden="true">🐾</span>
			ペットと一緒に使いたい方はこちら
			<span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
		</span>
		<span class="pet-bar__shine pointer-events-none absolute inset-0 z-0" aria-hidden="true"></span>
	</a>

	<!-- ================= HERO ================= -->
	<HeroBoard src={`${base}/images/main.png`} designW={420} designH={620}>
		<div class="absolute top-[52%] left-4">
			<div
				class="inline-block text-white leading-tight text-left"
				style="font-size:42pt;"
			>
				エステの<br />ある暮らし。
			</div>
		</div>

		<!-- ===== Awards ===== -->
		<div class="hero-awards">
			<img src={`${base}/images/awards/c1.png`} alt="award 1" />
			<img src={`${base}/images/awards/c2.png`} alt="award 2" />
		</div>
	</HeroBoard>

	<!-- ================= INTRO ================= -->
	<section class="relative px-6 pt-8" style="margin-top:12rem;">
		<div class="text-center">
			<span style="font-size:20px;">頑張る美容から、感じる美容へ</span>
			<br /><br /><br /><br />
			<div class="leading-9">
				気持ちいいから、<br />
				気づけば毎日続けてしまう。<br />
				続けるから、<br />
				きれいになる。<br />
			</div>
		</div>
	</section>

	<!-- ================= 水たまり：カルーセル ================= -->
	<section
		class="relative"
		style="margin-top:12rem;"
	>
		<div class="max-w-[100%] mx-auto">

			<Swiper
				slidesPerView={1}
				spaceBetween={1}
				centeredSlides={true}
				grabCursor={true}
				modules={[Pagination]}
				pagination={{ clickable: true }}
			>

				<!-- ===== Slide 1 ===== -->
				<SwiperSlide>
					<div class="panel-inner">
						<img
							src={`${base}/images/section/water_vibrated.png`}
							alt="自然由来の振動"
						/>

						<div class="panel-text left-bottom text-left">
							<h3>自然由来の振動</h3>
							<p>
								森などから抽出した自然由来の<br />
								微細な振動で揺れることで、<br />
								肌への摩擦を抑えながら、<br />
								負担をかけず本来の美しさを引き出します。
							</p>
						</div>
					</div>
				</SwiperSlide>

				<!-- ===== Slide 2 ===== -->
				<SwiperSlide>
					<div class="panel-inner">
						<img
							src={`${base}/images/section/esthe.png`}
							alt="振動 × エステティシャンの手技"
						/>

						<div class="panel-text right-top">
							<h3>
								振動 ×<br />
								エステティシャンの<br />
								手技リズム
							</h3>
							<p>
								エステティシャン監修で、<br />
								人の手のリズムを振動で再現。<br />
								心地よいケアをご自宅で体験できます。
							</p>
						</div>
					</div>
				</SwiperSlide>

			</Swiper>
		</div>
	</section>

	<!-- ================= MAIN IMAGE ================= -->
	<div class="text-center" style="margin-top:12rem;margin-bottom:6rem;">
		<img src={`${base}/images/main2.png`} alt="main2" class="w-[75%]" />
	</div>

	<!-- ================= USAGE ================= -->
	<section class="relative pt-8" style="margin-top:2rem;">
		<div class="text-right" style="font-size:24px;">
			<div style="line-height:2em;color:#FF62A5">
				<span style="font-size:1.3em;">１日の終わりに、</span><br />
				<span style="font-size:1.3em;">自分へのご褒美タイム</span>
			</div>

			<img
				src={`${base}/images/line.png`}
				alt=""
				class="ml-auto w-[75%] pb-8 pt-2"
			/>

			<div class="text-right pb-4 text-black">
				<div class="leading-8" style="font-size:18px;">
					使い方は簡単、顔に載せるだけ。<br />
					だから忙しい毎日でも続けられる。<br />
					お手持ちのパックと合わせてご利用いただくと、<br />
					10分でエステ1回分の効果が得られます。<br />
				</div>
			</div>

			<img
				src={`${base}/images/gohoubi_time.png`}
				alt="ご褒美タイム"
				class="ml-auto w-[40%] pb-8 pt-4"
			/>
		</div>

		<div class="max-w-[800px] mx-auto pt-12 pb-24 px-4">
			<div class="relative w-full pt-[56.25%]">
				<iframe
					class="absolute top-0 left-0 w-full h-full rounded-lg"
					src="https://www.youtube.com/embed/irmZgfw1CzQ?si=ok31EkunFMwryn__"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
				></iframe>
			</div>
		</div>
	</section>


	<!-- エビデンス -->
	<section class="relative" style="padding-top: 6rem; margin-top: -4rem; background-color: #FFF;">

		<div style="background-color: #FFADD0CC; padding-bottom: 84pt;">

			<div class="text-left pt-16 pl-4" style="line-height: 2.4em; color: #000000;">
				<span style="font-size: 24pt;">肌のたるみ、くすみに</span><br />
				<span style="font-size: 24pt;">素早くアプローチ</span>
			</div>

			<img
				src={`${base}/images/line2.png`}
				alt="line2"
				class="mr-auto w-[75%] pb-8 pt-2"
			/>

			<div class="text-left pb-4 pl-4 text-black">
				<div class="leading-7" style="font-size: 18px;">
					自然由来の振動で、<br />
					お肌のコラーゲン生成を促します。<br />
					気になるお肌のトラブルに、優しくアプローチ。<br />
					<br />
				</div>
			</div>

			<img
				src={`${base}/images/evidence.png`}
				alt="evidence"
				class="mr-auto ml-auto w-[96%] pt-2"
			/>
			<span>※白い線は表皮です</span>

			<div class="text-left pt-4 pb-4 pl-4 text-black">
				<div class="leading-7" style="font-size: 18px;">
					緑、黄色の表示部分がコラーゲン(密度高：黄色)<br />
					振動によって皮膚の下に沈んでいたコラーゲンが表皮に押し上げ<br />
					られて、肌にハリをもたらします。<br />
					<br />
				</div>
			</div>
		</div>
	</section>

	<section class="relative pt-8"
					 style="margin-top: 2rem; background-color: #FFF0; font-family: 'Hiragino Mincho Pro', serif;">
		<div class="text-right" style="font-size: 24px; padding-bottom: 24px;">
			<div style="line-height: 2.0em; color: #FF62A5">
				<span style="font-size: 1.4em;">顔以外にも、</span><br />
				<span style="font-size: 1.4em;">全身どこでも使えます</span>
			</div>

			<img
				src={`${base}/images/line.png`}
				alt="line"
				class=" ml-auto w-[75%] pb-8 pt-2"
			/>

			<div class="text-right pb-4 text-black">
				<div class="leading-8" style="font-size: 18px;">
					<br />
					顔以外にも、頭、お腹にもご利用いただけます。<br />
					身体を整えて、内側から綺麗に。<br />
					<br />
				</div>
			</div>

			<img
				src={`${base}/images/head.png`}
				alt="head"
				class=" ml-auto w-[60%] pb-8 pt-4"
			/>
			<img
				src={`${base}/images/stomach.png`}
				alt="stomach"
				class="mr-auto ml-2 w-[60%] pb-8 pt-2"
			/>
		</div>
	</section>

	<!-- エステのサブスク -->
	<section class="relative px-6 pt-8" style="margin-top: 2rem;">
		<div class="text-center" style="font-size: 24px;">
			エステのサブスク
			<img
				src={`${base}/images/line.png`}
				alt="line"
				class="mr-auto ml-auto w-[75%] pb-8 pt-2"
			/>
		</div>

		<div class="text-center pb-4 text-black">
			<div class="leading-8" style="font-size: 18px;">
				この繊細な振動は<br />
				一つひとつ職人の手で調整された<br />
				装置から生まれます<br /><br />

				高価な機器を、気軽に毎日の生活へ<br />
				月3,300円のサブスクリプションで、<br />
				家族みんなの“感じる美容”を叶えます。<br /><br />

				メンテナンスも丁寧に対応させて頂きます<br />
				合わなければ、いつでもご返却いただけます。<br /><br />

				まずは１ヶ月、初めてみませんか？<br /><br /><br />
			</div>
		</div>

		<button class="mr-auto ml-auto w-[40%] pb-8 pt-2" on:click={() => (showModal = true)}>
			<img
				src={`${base}/images/request.png`}
				alt="request"
			/>
		</button>

		<a
			href={petPageUrl}
			class="mx-auto mb-12 mt-2 flex w-full max-w-[560px] items-center justify-center gap-2 rounded-full border border-[#E6B9CE] bg-white px-5 py-4 text-sm font-semibold text-[#C45A8A] shadow-sm transition hover:bg-[#FFF7FB]"
		>
			🐾 ペットと一緒に使いたい方はこちら
			<span aria-hidden="true">→</span>
		</a>

		<div class="mx-auto mb-10 mt-4 max-w-[560px] rounded-2xl border border-[#FAD1E1] bg-[#FFF7FB] px-6 py-6 text-left shadow-sm">
			<div class="text-[13px] text-[#C45A8A]">ご契約中のお客さま</div>
			<h3 class="mt-1 text-lg text-[#6D2140]">解約のお手続きについて</h3>
			<p class="mt-3 text-sm leading-7 text-[#6B5460]">
				解約をご希望の場合は、メールにて承っております。下のボタンを押すとメールが開き、必要事項の入力欄が表示されますので、ご記入のうえ送信してください。
			</p>

			<a
				href={cancelMailto}
				class="mt-5 flex w-full items-center justify-center rounded-full bg-[#D9578D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C7487D]"
			>
				メールで解約を申し込む
			</a>

			<p class="mt-4 text-xs leading-6 text-[#8A6A77]">
				メールが開かない場合は <span class="text-[#6D2140]">{cancelMailAddress}</span> 宛に、お名前・お電話番号・ご契約メールアドレス・集荷先ご住所（レンタル品がある場合）をご記入のうえお送りください。お電話（03-3818-0408）でも承ります。
			</p>
		</div>
	</section>
	<div class="h-10"></div>
</section>

{#if showModal}
	<ModalFlow on:close={() => (showModal = false)} />
{/if}

<style>
    /* ===== ペット導線ラベル（フロストグラス＋みずみずしい光沢） ===== */
    .pet-bar {
        background: linear-gradient(
            100deg,
            rgba(226, 100, 152, 0.66) 0%,
            rgba(234, 130, 178, 0.6) 55%,
            rgba(150, 209, 222, 0.54) 100%
        );
        backdrop-filter: blur(8px) saturate(1.25);
        -webkit-backdrop-filter: blur(8px) saturate(1.25);
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    }
    .pet-bar__label {
        letter-spacing: 0.04em;
        text-shadow: 0 1px 1px rgba(105, 35, 75, 0.6), 0 1px 7px rgba(105, 35, 75, 0.45);
    }
    .pet-bar__shine {
        background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 100%
        );
        transform: translateX(-130%);
        animation: petShine 5s ease-in-out infinite;
    }
    @keyframes petShine {
        0% { transform: translateX(-130%); }
        28%, 100% { transform: translateX(130%); }
    }
    @media (prefers-reduced-motion: reduce) {
        .pet-bar__shine { animation: none; opacity: 0; }
    }

    /* ===== カルーセル共通 ===== */

    .panel-inner {
        position: relative;
        height: 80vh; /* ← 高さ固定 */
        aspect-ratio: 396 / 679; /* Figma比率 */
        margin: 0 auto;
    }

    .panel-inner img {
        height: 100%;
        width: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
    }

    /* テキスト */
    .panel-text {
        position: absolute;
        color: #fff;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        max-width: 80%;
    }

    .panel-text h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 6px;
        line-height: 1.4;
    }

    .panel-text p {
        font-size: 13px;
        line-height: 1.7;
        opacity: 0.95;
    }

    /* 配置 */
    .left-bottom {
        left: 12px;
        bottom: 16px;
    }

    .right-top {
        right: 12px;
        top: 16px;
        text-align: right;
    }

    .hero-awards {
        position: absolute;
        bottom: 8%;
        left: 26%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }

    .hero-awards img {
        height: 8vh;
        width: auto;
        opacity: 1;
    }

    /* スマホ微調整 */
    @media (max-width: 480px) {
        .hero-awards {
            bottom: 3%;
            gap: 2px;
        }

        .hero-awards img {
            height: 80px;
        }
    }

    :global(.swiper-pagination) {
        bottom: -28px; /* 画像の下に少し余白 */
    }

    :global(.swiper-pagination-bullet) {
        background: #ccc;
        opacity: 1;
    }

    :global(.swiper-pagination-bullet-active) {
        background: #555;
    }
</style>
