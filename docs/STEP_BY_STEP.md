# LogBook 完全セットアップガイド（画面付き解説）

初めての方でも確実にセットアップできるように、各手順を詳しく説明します。

## 📌 全体の流れ

```
1. Firebase設定 (15分)
   ↓
2. ローカル動作確認 (5分)
   ↓
3. Vercelデプロイ (10分)
   ↓
4. 完成！
```

---

## 🔥 Part 1: Firebase設定

### 手順1-1: Firebaseコンソールを開く

1. ブラウザで https://console.firebase.google.com/ を開く
2. Googleアカウントでログイン

**見えている画面:**
- 上部に「プロジェクトを追加」ボタン
- 既存のプロジェクト一覧（初めての場合は空）

### 手順1-2: プロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名入力画面が表示される

**入力内容:**
```
プロジェクト名: logbook-app
（または好きな名前でOK）
```

3. 「続行」をクリック

### 手順1-3: Googleアナリティクスの設定

**画面に表示される質問:**
「このプロジェクトで Google アナリティクスを有効にしますか?」

**推奨設定:**
- トグルを**オフ**にする（今回は不要）

4. 「プロジェクトを作成」をクリック
5. 30秒ほど待つ（プログレスバーが表示される）
6. 「続行」をクリック

---

### 手順1-4: Webアプリを登録

**現在の画面:**
- Firebaseプロジェクトのダッシュボード
- 中央に「始めるにはアプリを追加してください」

1. **「</>」アイコン（Web）をクリック**

**表示される画面:**
「ウェブアプリにFirebaseを追加」

2. **入力内容:**
```
アプリのニックネーム: LogBook Web
```

3. **「Firebase Hosting を設定しますか?」**
   - チェック**なし**でOK

4. 「アプリを登録」をクリック

### 手順1-5: 設定情報をコピー（超重要！）

**表示される画面:**
「Firebase SDK の追加」というタイトルで、コードが表示されます。

**この部分をコピーしてメモ帳などに保存:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",                          // ← この値
  authDomain: "logbook-app.firebaseapp.com",    // ← この値
  projectId: "logbook-app",                      // ← この値
  storageBucket: "logbook-app.appspot.com",     // ← この値
  messagingSenderId: "123456789",                // ← この値
  appId: "1:123456789:web:abcdef123456"         // ← この値
};
```

**💡 重要:** この6つの値を安全な場所にコピーしてください！

5. 「コンソールに進む」をクリック

---

### 手順1-6: Authentication（認証）を設定

**現在の画面:**
- プロジェクトのダッシュボード

1. **左メニューから「Authentication」をクリック**
2. 「始める」ボタンをクリック

**表示される画面:**
「Sign-in method」タブ（ログイン方法の一覧）

3. **一覧から「匿名」を探してクリック**

**表示されるダイアログ:**
「匿名のステータス」

4. **「有効にする」をオン（青色）に切り替え**
5. 「保存」をクリック

**確認:**
- 「匿名」の行のステータスが「有効」になっている

---

### 手順1-7: Firestore Database（データベース）を作成

1. **左メニューから「Firestore Database」をクリック**
2. 「データベースの作成」をクリック

**表示される画面:**
「セキュリティ保護ルールを設定」

3. **「本番環境モードで開始」を選択**
4. 「次へ」をクリック

**表示される画面:**
「Cloud Firestoreのロケーションを設定」

5. **ロケーション選択:**
```
asia-northeast1 (Tokyo)
```
（日本にいる場合はこれを選択）

6. 「有効にする」をクリック
7. 1-2分待つ（データベース作成中）

---

### 手順1-8: セキュリティルールを設定

**現在の画面:**
- Firestore Databaseの画面
- 上部に「データ」「ルール」「インデックス」などのタブ

1. **「ルール」タブをクリック**

**表示される内容:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

2. **このルールを全部削除して、以下に置き換え:**

プロジェクトの`firestore.rules`ファイルの内容をコピー&ペースト

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーが認証されているかチェック
    function isAuthenticated() {
      return request.auth != null;
    }

    // ユーザーが自分のドキュメントにアクセスしているかチェック
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // usersコレクション
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // entriesコレクション
    match /entries/{entryId} {
      allow read, delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;

      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.content is string &&
        request.resource.data.createdAt is timestamp &&
        request.resource.data.updatedAt is timestamp;

      allow update: if isAuthenticated() &&
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
    }

    // entryExportsコレクション
    match /entryExports/{exportId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;

      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.rangeStart is timestamp &&
        request.resource.data.rangeEnd is timestamp &&
        request.resource.data.createdAt is timestamp;

      allow update, delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. 「公開」ボタンをクリック

**確認ダイアログが表示される:**
「ルールを公開してもよろしいですか?」

4. 「公開」をクリック

✅ **Firebase設定完了！**

---

## 💻 Part 2: ローカルで動作確認

### 手順2-1: 環境変数ファイルを作成

1. **プロジェクトのルートディレクトリで`.env.local`ファイルを作成**

**ファイルの場所:**
```
logbook/
  ├── .env.local          ← これを作成
  ├── .env.local.example
  ├── app/
  ├── components/
  └── ...
```

2. **以下の内容を記述（手順1-5でメモした値を使用）:**

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=logbook-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=logbook-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=logbook-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**💡 注意:**
- `=` の前後にスペースは入れない
- 値は引用符で囲まない

### 手順2-2: パッケージをインストール

ターミナル（コマンドプロンプト）を開いて:

```bash
# プロジェクトディレクトリに移動
cd /path/to/logbook

# 依存パッケージをインストール
npm install
```

**表示される内容:**
- パッケージのダウンロード進捗
- 1-2分で完了

### 手順2-3: 開発サーバーを起動

```bash
npm run dev
```

**表示される内容:**
```
  ▲ Next.js 15.1.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### 手順2-4: ブラウザで確認

1. ブラウザで http://localhost:3000 を開く

**表示される画面:**
- LogBookのログイン画面
- 「ログインして始める」ボタン

2. **「ログインして始める」をクリック**

**表示される画面:**
- ダッシュボード
- 投稿フォーム
- カレンダー

3. **テスト投稿してみる:**
```
タイトル: テスト
本文: 動作確認
```

4. 送信ボタンをクリック

**確認:**
- 投稿が一覧に表示される
- Firebase Consoleの「Firestore Database」→「データ」タブで、`entries`コレクションに投稿が保存されている

✅ **ローカル動作確認完了！**

---

## 🚀 Part 3: Vercelにデプロイ

### 手順3-1: Vercelアカウント作成

1. https://vercel.com/ を開く
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubアカウントでログイン・認証

### 手順3-2: プロジェクトをインポート

**表示される画面:**
- Vercelダッシュボード

1. 「Add New...」ボタン → 「Project」を選択

**表示される画面:**
「Import Git Repository」

2. **`LogBook`リポジトリを探す**
   - 検索ボックスで`LogBook`を検索
   - 見つかったら「Import」をクリック

### 手順3-3: プロジェクト設定

**表示される画面:**
「Configure Project」

**自動的に設定される項目:**
- Project Name: `logbook`
- Framework Preset: `Next.js`
- Root Directory: `./`

**何も変更せずOK！**

### 手順3-4: 環境変数を追加（重要！）

画面を下にスクロールして「Environment Variables」セクションへ

**6つの環境変数を1つずつ追加:**

1. **1つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_API_KEY
VALUE: AIzaSyA...（手順1-5でメモした値）
```
- 「All」を選択（Production, Preview, Development）
- 「Add」をクリック

2. **2つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
VALUE: logbook-app.firebaseapp.com
```
- 「All」を選択
- 「Add」をクリック

3. **3つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_PROJECT_ID
VALUE: logbook-app
```
- 「All」を選択
- 「Add」をクリック

4. **4つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
VALUE: logbook-app.appspot.com
```
- 「All」を選択
- 「Add」をクリック

5. **5つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
VALUE: 123456789
```
- 「All」を選択
- 「Add」をクリック

6. **6つ目:**
```
NAME: NEXT_PUBLIC_FIREBASE_APP_ID
VALUE: 1:123456789:web:abcdef123456
```
- 「All」を選択
- 「Add」をクリック

**確認:**
- 6つの環境変数がすべて表示されている

### 手順3-5: デプロイ実行

1. 「Deploy」ボタンをクリック

**表示される内容:**
- ビルドログがリアルタイムで表示
- 2-3分待つ

**成功時の表示:**
```
✓ Build completed
✓ Deployment completed
```

2. 「Congratulations!」画面が表示される
3. デプロイされたURLが表示される
   - 例: `https://logbook-abc123.vercel.app`

### 手順3-6: Firebase承認済みドメインに追加

**重要:** このステップをスキップすると認証エラーになります！

1. **Firebase Consoleを開く**
   - https://console.firebase.google.com/
   - `logbook-app`プロジェクトを選択

2. **Authentication → Settings タブ**
3. **下にスクロールして「承認済みドメイン」セクション**

**現在の承認済みドメイン:**
- `localhost`
- `logbook-app.firebaseapp.com`
- `logbook-app.web.app`

4. **「ドメインを追加」をクリック**

5. **VercelのURLを入力:**
```
logbook-abc123.vercel.app
```
（手順3-5で表示されたURLの`https://`を除いた部分）

6. 「追加」をクリック

### 手順3-7: 本番環境で動作確認

1. **VercelのURLにアクセス**
   - `https://logbook-abc123.vercel.app`

2. **「ログインして始める」をクリック**

3. **投稿してみる**

4. **Firebase Consoleで確認**
   - Firestore Database → データタブ
   - `entries`コレクションに投稿が保存されている

✅ **デプロイ完了！**

---

## 🎉 完成！

これでLogBookが完全に動作しています！

### 今後の使い方

**ローカル開発:**
```bash
npm run dev
```

**本番環境:**
- VercelのURL（`https://logbook-xxx.vercel.app`）にアクセス

**自動デプロイ:**
- GitHubの`main`ブランチにプッシュすると自動的にVercelにデプロイされます

---

## ❓ トラブルシューティング

### エラー: "Missing or insufficient permissions"

**原因:** Firestoreセキュリティルールが正しく設定されていない

**解決方法:**
1. Firebase Console → Firestore Database → ルールタブ
2. 手順1-8のルールが正しく設定されているか確認
3. 「公開」をクリック

### エラー: "Firebase: Error (auth/unauthorized-domain)"

**原因:** Firebaseの承認済みドメインにVercelのURLが追加されていない

**解決方法:**
1. 手順3-6を実施

### Vercelのビルドが失敗する

**原因:** 環境変数が正しく設定されていない

**解決方法:**
1. Vercel → プロジェクト → Settings → Environment Variables
2. 6つの環境変数がすべて設定されているか確認
3. 値が正しいか確認
4. Deployments → 最新のデプロイ → Redeploy

---

## 📞 サポート

問題が解決しない場合:
1. GitHubリポジトリのIssuesで質問
2. 詳細ドキュメントを確認:
   - `docs/FIREBASE_SETUP.md`
   - `docs/VERCEL_DEPLOY.md`
