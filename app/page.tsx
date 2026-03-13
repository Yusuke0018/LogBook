'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading, signInWithGoogle, signInAnonymous } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Googleサインインエラー:', error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymous();
      router.push('/dashboard');
    } catch (error) {
      console.error('匿名サインインエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl mb-6 shadow-card">
            <BookOpenIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            LogBook
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            学びを蓄積する、シンプルなアプリ
          </p>
        </div>

        <div className="card p-8 space-y-5">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-button shadow-card hover:shadow-soft-lg transform hover:scale-[1.01] transition-all flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">または</span>
            </div>
          </div>

          <button
            onClick={handleAnonymousSignIn}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 px-6 rounded-button shadow-card hover:shadow-soft-lg transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <SparklesIcon className="h-5 w-5" />
            ゲストとして始める
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            ゲストは一時的なアカウントです。複数デバイスで使うにはGoogleログインを。
          </p>
        </div>
      </div>
    </div>
  );
}
