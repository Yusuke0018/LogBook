# LogBook クイックスタートガイド

最短でLogBookを動かすための簡易ガイドです。

## 📋 準備するもの

- Googleアカウント
- GitHubアカウント（リポジトリは既に作成済み）

## 🚀 5ステップでスタート

### ステップ1: Firebaseプロジェクト作成（5分）

1. https://console.firebase.google.com/ を開く
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `logbook-app` と入力
4. Googleアナリティクス: オフでOK
5. 「プロジェクトを作成」をクリック

### ステップ2: Webアプリを登録（3分）

1. 「</>」（Webアイコン）をクリック
2. アプリのニックネーム: `LogBook Web`
3. 「アプリを登録」をクリック
4. **表示される設定情報をメモ（重要！）**

```javascript
// この情報をコピーしておく
apiKey: "AIza..."
authDomain: "xxx.firebaseapp.com"
projectId: "xxx"
storageBucket: "xxx.appspot.com"
messagingSenderId: "123..."
appId: "1:123..."
```

### ステップ3: Firebase機能を有効化（3分）

#### 認証を有効化
1. 左メニュー「Authentication」→「始める」
2. 「Sign-in method」タブ
3. 「匿名」をクリック→有効にする→保存

#### Firestoreを作成
1. 左メニュー「Firestore Database」→「データベースの作成」
2. 本番環境モード→次へ
3. ロケーション: `asia-northeast1 (Tokyo)`→有効にする

#### セキュリティルール設定
1. 「ルール」タブをクリック
2. プロジェクトの`firestore.rules`の内容をコピー&貼り付け
3. 「公開」をクリック

### ステップ4: ローカルで動作確認（5分）

```bash
# プロジェクトディレクトリに移動
cd /tmp/logbook

# .env.localファイルを作成
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=（ステップ2でメモしたapiKey）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=（authDomain）
NEXT_PUBLIC_FIREBASE_PROJECT_ID=（projectId）
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=（storageBucket）
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=（messagingSenderId）
NEXT_PUBLIC_FIREBASE_APP_ID=（appId）
EOF

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いて動作確認！

### ステップ5: Vercelにデプロイ（5分）

1. https://vercel.com/ を開く
2. 「Continue with GitHub」でログイン
3. 「Add New...」→「Project」
4. `LogBook`リポジトリを「Import」
5. **Environment Variables**セクションで環境変数を追加:
   - ステップ2でメモした6つの値をすべて追加
   - すべて「All」環境を選択
6. 「Deploy」をクリック

デプロイ完了後、表示されるURLにアクセス！

### ステップ6: Firebaseにデプロイ先を登録（2分）

1. Firebase Console → Authentication → Settings
2. 「承認済みドメイン」→「ドメインを追加」
3. VercelのURL（`xxx.vercel.app`）を入力→追加

## ✅ 完了！

これでLogBookが使えるようになりました。

## 📝 基本的な使い方

1. **ログイン**: 「ログインして始める」をクリック
2. **投稿**: タイトルと本文を入力して送信
3. **カレンダー**: 日付をクリックしてその日の投稿を表示
4. **コピー**: クリップボードアイコンで投稿をコピー
5. **CSV出力**: ダウンロードアイコンで期間指定してエクスポート

## 🔧 よくある問題

### 「Missing or insufficient permissions」エラー
→ Firestoreセキュリティルールが正しく設定されているか確認

### 認証できない
→ Authenticationで匿名認証が有効になっているか確認

### Vercelで動かない
→ Firebaseの承認済みドメインにVercelのURLを追加

## 📚 詳細ドキュメント

- Firebase設定の詳細: `docs/FIREBASE_SETUP.md`
- Vercelデプロイの詳細: `docs/VERCEL_DEPLOY.md`

## 🆘 サポート

問題が解決しない場合は、GitHubのIssuesで質問してください。
