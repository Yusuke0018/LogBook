'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signIn();
      router.push('/dashboard');
    } catch (error) {
      console.error('サインインエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              LogBook
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              個人専用の日記ログアプリケーション
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              ログインして始める
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p className="font-semibold">機能:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>日次ログ投稿</li>
              <li>カレンダー表示</li>
              <li>クリップボードコピー</li>
              <li>CSV出力</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
