# LogBook

個人専用の日記ログアプリケーション

## 機能

- 日次ログ投稿（タイトル任意、本文必須、タグ/カテゴリ任意）
- 一覧/詳細表示（当日分、過去分の確認・編集・削除）
- カレンダー表示（月間カレンダーで投稿有無をハイライト）
- クリップボードコピー（当日の全投稿をまとめてコピー）
- CSV出力（任意期間を指定してダウンロード）

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Vercel (デプロイ)

## セットアップ

```bash
npm install
```

環境変数を`.env.local`に設定:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

開発サーバー起動:

```bash
npm run dev
```

## デプロイ

Vercelにデプロイする際は、環境変数を設定してください。
