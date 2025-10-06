# Firebase設定ガイド

LogBookアプリケーションのFirebase設定手順を説明します。

## 1. Firebaseプロジェクトの作成

### 1-1. Firebaseコンソールにアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. Googleアカウントでログイン（まだの場合はGoogleアカウントを作成）

### 1-2. プロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `logbook-app`）
3. 「続行」をクリック
4. Google アナリティクス: 必要に応じて有効化（オフでもOK）
5. 「プロジェクトを作成」をクリック
6. 作成完了まで待つ（30秒程度）
7. 「続行」をクリックしてダッシュボードへ

## 2. Webアプリの登録

### 2-1. アプリを追加

1. プロジェクトのダッシュボードで「</>」（Webアイコン）をクリック
2. アプリのニックネーム: `LogBook Web`
3. Firebase Hosting: チェック不要
4. 「アプリを登録」をクリック

### 2-2. 設定情報をコピー

表示される設定情報をメモしてください（後で使います）:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

「コンソールに進む」をクリック

## 3. Authentication（認証）の設定

### 3-1. Authenticationを有効化

1. 左メニューから「Authentication」をクリック
2. 「始める」をクリック

### 3-2. 匿名認証を有効化

1. 「Sign-in method」タブをクリック
2. 「匿名」をクリック
3. 「有効にする」をオンに切り替え
4. 「保存」をクリック

## 4. Firestore Database（データベース）の設定

### 4-1. Firestoreを作成

1. 左メニューから「Firestore Database」をクリック
2. 「データベースの作成」をクリック

### 4-2. ロケーションを選択

1. 本番環境モードで開始: 選択
2. 「次へ」をクリック
3. ロケーション: `asia-northeast1 (Tokyo)` を選択（日本の場合）
4. 「有効にする」をクリック
5. 作成完了まで待つ（1-2分程度）

### 4-3. セキュリティルールを設定

1. 「ルール」タブをクリック
2. 以下のルールをコピーして貼り付け:

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

3. 「公開」をクリック

## 5. プロジェクトに環境変数を設定

### 5-1. .env.localファイルを作成

プロジェクトのルートディレクトリに`.env.local`ファイルを作成:

```bash
# Firebaseコンソールで取得した値を貼り付け
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**重要**: `.env.local`ファイルは`.gitignore`に含まれているため、Gitで管理されません。

### 5-2. 値の確認方法

Firebaseコンソールで値を再確認する方法:

1. 左上の歯車アイコン → 「プロジェクトの設定」をクリック
2. 下にスクロールして「マイアプリ」セクションを表示
3. 登録したWebアプリの「SDK の設定と構成」で確認

## 6. 動作確認

### 6-1. ローカルで起動

```bash
# 依存パッケージをインストール（初回のみ）
npm install

# 開発サーバーを起動
npm run dev
```

### 6-2. ブラウザで確認

1. http://localhost:3000 を開く
2. 「ログインして始める」をクリック
3. ダッシュボードが表示されればOK

### 6-3. Firebaseコンソールで確認

1. 日記を1つ投稿
2. Firebaseコンソールの「Firestore Database」→「データ」タブ
3. `entries`コレクションに投稿が追加されていることを確認

## トラブルシューティング

### エラー: "Firebase: Error (auth/configuration-not-found)"

- 原因: `.env.local`ファイルが正しく読み込まれていない
- 解決:
  1. `.env.local`がプロジェクトルートにあるか確認
  2. 開発サーバーを再起動（Ctrl+Cで停止 → `npm run dev`）

### エラー: "Missing or insufficient permissions"

- 原因: Firestoreのセキュリティルールが正しく設定されていない
- 解決:
  1. Firebaseコンソールで「Firestore Database」→「ルール」タブ
  2. 上記のルールが正しく設定されているか確認
  3. 「公開」をクリック

### 認証が動作しない

- 原因: 匿名認証が有効になっていない
- 解決:
  1. Firebaseコンソールで「Authentication」→「Sign-in method」
  2. 「匿名」が「有効」になっているか確認

## 次のステップ

Firebase設定が完了したら、Vercelへのデプロイに進みましょう。

デプロイ方法は`VERCEL_DEPLOY.md`を参照してください。
