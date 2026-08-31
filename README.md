# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## ルーティング構成

`src/routes/` はレイアウトグループで「機能」と「見た目」を分けている。

```
src/routes/
├── +layout.svelte          全ページ共通の機能シェル（店舗コード/クーポン/紹介者の取り込み、
│                           申込モーダル・決済戻り・紹介者入力・ペット違いの各ダイアログ）
├── +layout.server.ts       prerender = true
├── (site)/                 サイト本体（URL には現れない）
│   ├── +layout.svelte      背景・固定ヘッダー（ペット導線 / ロゴ / SNS / 申込ボタン）・フッター
│   ├── +page.svelte        トップ /
│   ├── [id]/               /XXXX → /?agencyCode=XXXX
│   ├── regal/ terms_of_service/ privacy_policy/
└── lp/                     Instagram 流入用 LP（ヘッダー無し・専用フッター）
    ├── +layout.svelte
    ├── +page.svelte        /lp（デザイン: addict/design_lp.png、素材: static/images/lp/）
    └── [id]/               /lp/XXXX → /lp?agencyCode=XXXX
```

- 申込は `$lib/applyModal` の `openApplyModal()` を呼ぶだけ（モーダル本体はルートレイアウトに1つ）。
- 解約カードは `$lib/CancelPortal.svelte` をトップと LP で共用。
- 店舗コード付きパス（`/XXXX`, `/lp/XXXX`）は `$lib/agency/AgencyCodeRedirect.svelte` が
  `?agencyCode=` に付け替えてフル遷移する。静的ビルドでは列挙できないため `prerender = false` とし、
  `svelte.config.js` の `fallback: '404.html'`（GitHub Pages の 404 を SPA フォールバックに流用）で動かす。

## 関連リンク一覧（グループサイト）

各サイトのフッター「関連リンク」のマスター一覧。リンクの追加・変更時は、
以下4リポジトリのフッター実装と各READMEのこの表をあわせて更新すること。

- `my-esthe`（わたしのエステ） … `src/lib/RelatedLinksFooter.svelte`
- `dr.ai-hp`（Dr.AI） … `src/domains/Footer.svelte`
- `facetherapie-hp`（ファセテラピーHP） … `src/app/page.tsx` フッター + `src/i18n/locales/{ja,en}.json`
- `beauty-ai/beauty-ai-frontend`（美容ai.com） … `src/components/templates/home/HomeFooter.vue`

| 分類 | 名称 | URL | 店舗コード書式 |
|---|---|---|---|
| サービス | わたしのエステ | https://わたしのエステ.com/ | `?agencyCode=XXXX` |
| サービス | 美容ai.com | https://美容ai.com/ | なし（URLでは受け付けない） |
| サービス | Dr.AI | https://dr-ai.health/ | パス `/XXXX` または `?agencyCode=XXXX`（短縮 `?a=` も可） |
| サービス | Wellbeing Room | https://wellbeingroom.tokyo/ | `?agencyCode=XXXX` |
| サービス | 顔リズム | https://顔リズム.com/ | なし（Wix・外部管理） |
| ペット | ペットウェルネス | https://pet.wellbeingroom.tokyo/ | パス `/XXXX` または `?agencyCode=XXXX` |
| ペット | ペット介護 | https://ペット介護.com/ | `?agency_code=XXXX`（※スネークケース）※フッター非掲載 |
| ショップ・スクール | 公式ショップ | https://facetherapie.shop/ | `?agencyCode=XXXX` |
| ショップ・スクール | 東京フェイセテラピー（スクール） | https://tokyo-ft.com/ | なし（外部管理） |
| 会社 | ファセテラピー（会社HP） | https://facetherapie.com/ | なし |

運用ルール:

- 各サイトのフッターでは自サイト自身は表示しない。
- ペット介護はフッターの関連リンクに掲載しない（2026-08-26決定）。
- 店舗コード対応サイトへは、リンク元で有効な店舗コードがあれば上記書式で引き継ぐ。
  なければ素のURLでリンクし、遷移先側のデフォルト（2139）にフォールバックさせる。
- 外部リンクは `target="_blank"` + `rel="noopener"` で開く。
