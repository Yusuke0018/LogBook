# LogBook

学んだことをシンプルに蓄積するアプリ

## 機能

- 学びの投稿（テキスト + タグ + 出典）
- キーワード・タグ検索
- クリップボードコピー / CSV出力
- 二十四節気の背景テーマ
- ダークモード

## 技術スタック

- Next.js (App Router) / React / TypeScript
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
