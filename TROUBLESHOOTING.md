# Vercelデプロイ トラブルシューティング

## 環境変数が反映されない場合の対処法

### 1. 環境変数の名前を再確認

**重要**: 変数名は完全に一致している必要があります。

正しい変数名（コピー用）:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**よくある間違い**:
- ❌ `next_public_firebase_api_key` (小文字)
- ❌ `NEXT_PUBLIC_FIREBASE_APIKEY` (アンダースコアなし)
- ❌ スペースや余分な文字が含まれている

### 2. 環境変数の値を再確認

各値にスペースや改行が含まれていないか確認:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCYcuVVk2eMXjyKq4eB14WnoDKFIspU68g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logbook-288c2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logbook-288c2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logbook-288c2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=668506769821
NEXT_PUBLIC_FIREBASE_APP_ID=1:668506769821:web:c92f048ce39da4b4830774
```

### 3. 強制的な再デプロイ

#### 方法1: Gitから再デプロイ

```bash
cd /path/to/logbook
git commit --allow-empty -m "force redeploy"
git push origin main
```

#### 方法2: Vercelで完全な再デプロイ

1. Vercel Dashboard → Deployments
2. 最新のデプロイの「⋯」メニュー
3. 「Redeploy」を選択
4. ✅ **「Use existing Build Cache」のチェックを外す**
5. 「Redeploy」をクリック

### 4. ブラウザのキャッシュをクリア

環境変数が反映されていても、ブラウザが古いバージョンをキャッシュしている可能性:

#### Chrome/Edge:
1. F12で開発者ツールを開く
2. ページを右クリック
3. 「キャッシュの消去とハード再読み込み」

#### Firefox:
1. Ctrl+Shift+Del
2. 「キャッシュ」を選択
3. 「今すぐクリア」

#### Safari:
1. Cmd+Option+E
2. ページをリロード

### 5. デプロイログを確認

1. Vercel Dashboard → Deployments
2. 最新のデプロイをクリック
3. 「Building」セクションを確認
4. 環境変数が正しく読み込まれているか確認

探すべきログ:
```
- Environments: .env.local
✓ Creating an optimized production build
```

### 6. Firebaseの設定を確認

#### A. Authentication
https://console.firebase.google.com/project/logbook-288c2/authentication

- 匿名認証が「有効」になっているか確認

#### B. 承認済みドメイン
https://console.firebase.google.com/project/logbook-288c2/authentication/settings

以下のドメインが承認済みか確認:
- `localhost`
- `logbook-288c2.firebaseapp.com`
- `your-vercel-url.vercel.app` ← VercelのURLを追加

### 7. 詳細なデバッグ

以下のURLにアクセスして、実際に読み込まれている環境変数を確認:

Vercelアプリで開発者ツール（F12）を開き、Consoleに以下を入力:

```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

**期待される出力**:
```
API Key: AIzaSyCYcuVVk2eMXjyKq4eB14WnoDKFIspU68g
```

**もし `dummy-api-key` と表示される場合**:
- 環境変数が読み込まれていない
- 再デプロイが必要

### 8. 最終手段: プロジェクトを再作成

環境変数の問題が解決しない場合:

1. Vercelで新しいプロジェクトを作成
2. 同じGitHubリポジトリをインポート
3. 環境変数を設定（コピー&ペーストで確実に）
4. デプロイ

## よくある質問

### Q: 環境変数を設定したのに反映されない
**A**: 環境変数を追加/変更した後は、必ず再デプロイが必要です。

### Q: 再デプロイしても変わらない
**A**: ブラウザのキャッシュをクリアしてください。

### Q: ローカルでは動くがVercelで動かない
**A**: Vercelの環境変数設定を確認してください。

### Q: "dummy-api-key"エラーが出続ける
**A**:
1. 環境変数の名前が完全一致しているか確認
2. キャッシュなしで再デプロイ
3. ブラウザのハードリフレッシュ

## サポート

それでも解決しない場合は、以下の情報を共有してください:
1. Vercelのデプロイログのスクリーンショット
2. ブラウザのConsoleのエラーメッセージ
3. 環境変数設定のスクリーンショット（値は隠してOK）
