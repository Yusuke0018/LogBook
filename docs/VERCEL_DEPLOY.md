# Vercelデプロイガイド

LogBookアプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubリポジトリにコードがプッシュ済み
- Firebaseの設定が完了している

## 1. Vercelアカウントの作成

### 1-1. Vercelにサインアップ

1. [Vercel](https://vercel.com/) にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubアカウントでログイン・認証

## 2. プロジェクトのインポート

### 2-1. 新しいプロジェクトを作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで`LogBook`リポジトリを探す
3. 「Import」をクリック

### 2-2. プロジェクト設定

1. **Project Name**: `logbook`（自動入力されます）
2. **Framework Preset**: `Next.js`（自動検出されます）
3. **Root Directory**: `.`（デフォルトのまま）
4. **Build Command**: `npm run build`（自動設定）
5. **Output Directory**: `.next`（自動設定）

## 3. 環境変数の設定

### 3-1. Environment Variables を追加

「Environment Variables」セクションで以下を設定:

#### 必須の環境変数

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebaseの`apiKey` | All (Production, Preview, Development) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebaseの`authDomain` | All |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebaseの`projectId` | All |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebaseの`storageBucket` | All |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebaseの`messagingSenderId` | All |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebaseの`appId` | All |

### 3-2. 環境変数の入力方法

各環境変数を1つずつ追加:

1. 「NAME」にキー名を入力（例: `NEXT_PUBLIC_FIREBASE_API_KEY`）
2. 「VALUE」に値を入力（`.env.local`からコピー）
3. 「Add」をクリック
4. すべての環境変数を追加するまで繰り返し

## 4. デプロイの実行

### 4-1. デプロイ開始

1. すべての設定を確認
2. 「Deploy」をクリック
3. ビルドプロセスが開始（2-3分程度）

### 4-2. デプロイ完了

1. ✅ ビルドが成功すると「Congratulations!」画面が表示
2. デプロイされたURLが表示されます（例: `https://logbook-xxx.vercel.app`）
3. 「Visit」をクリックしてアプリを確認

## 5. カスタムドメインの設定（オプション）

### 5-1. ドメインを追加

1. プロジェクトの「Settings」タブをクリック
2. 左メニューから「Domains」を選択
3. 独自ドメインを入力して「Add」
4. DNS設定の指示に従う

## 6. 自動デプロイの設定

Vercelは自動的にGitHub連携が設定されています:

- **mainブランチにプッシュ** → 本番環境に自動デプロイ
- **他のブランチにプッシュ** → プレビュー環境に自動デプロイ

### 6-1. デプロイの確認

1. プロジェクトの「Deployments」タブで履歴を確認
2. 各デプロイの詳細、ログを閲覧可能

## 7. Firebaseの設定更新

### 7-1. 承認済みドメインの追加

VercelのURLをFirebaseの承認済みドメインに追加:

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 「Authentication」→「Settings」タブ
4. 「承認済みドメイン」セクション
5. 「ドメインを追加」をクリック
6. VercelのURL（例: `logbook-xxx.vercel.app`）を入力
7. 「追加」をクリック

## 8. 動作確認

### 8-1. 本番環境でテスト

1. VercelのURLにアクセス
2. 「ログインして始める」をクリック
3. 日記を投稿してみる
4. Firebaseコンソールでデータを確認

## トラブルシューティング

### ビルドエラー: "Module not found"

- 原因: 依存パッケージが`package.json`に含まれていない
- 解決:
  ```bash
  npm install
  git add package.json package-lock.json
  git commit -m "fix: update dependencies"
  git push
  ```

### 環境変数が反映されない

- 原因: 環境変数の設定後に再デプロイが必要
- 解決:
  1. Vercelダッシュボードの「Deployments」タブ
  2. 最新のデプロイの「...」メニュー → 「Redeploy」

### Firebase認証エラー

- 原因: VercelのドメインがFirebaseで承認されていない
- 解決: 上記「7. Firebaseの設定更新」を実施

## 便利なコマンド

### ローカルでVercel環境をシミュレート

```bash
# Vercel CLIをインストール
npm i -g vercel

# ローカルでVercel環境を起動
vercel dev
```

### 環境変数をローカルにプル

```bash
vercel env pull .env.local
```

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env.local`は絶対にGitにコミットしない
   - 本番環境の環境変数はVercelのダッシュボードでのみ管理

2. **Firebaseセキュリティルール**
   - 定期的にルールを見直す
   - 不要なアクセス権限は削除

3. **HTTPS**
   - VercelはデフォルトでHTTPSが有効
   - カスタムドメインでもHTTPSが自動設定

## 次のステップ

デプロイが完了したら:

1. チームメンバーとURLを共有
2. アプリの使用を開始
3. フィードバックを収集して改善

必要に応じて追加機能を実装し、GitHubにプッシュすると自動的にデプロイされます。
