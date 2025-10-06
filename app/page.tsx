'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Force dynamic rendering
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
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <SparklesIcon className="h-8 w-8 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: BookOpenIcon,
      title: '日次ログ投稿',
      description: '毎日の記録を簡単に残せます',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: CalendarDaysIcon,
      title: 'カレンダー表示',
      description: '過去の記録を一覧で確認',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      icon: DocumentTextIcon,
      title: 'クリップボードコピー',
      description: '簡単にテキストをコピー',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: ArrowDownTrayIcon,
      title: 'CSV出力',
      description: 'データを自由にエクスポート',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 dark:bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 dark:bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-100 dark:bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl mb-6 shadow-soft-lg">
              <BookOpenIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-display font-bold mb-4 gradient-text">
              LogBook
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              あなたの日々を記録する、シンプルで美しい日記アプリ
            </p>
          </div>

          {/* Main Card */}
          <div className="glass rounded-3xl shadow-soft-lg p-8 mb-8 animate-slide-up space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-lg py-4 px-8 rounded-xl shadow-soft hover:shadow-soft-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">または</span>
              </div>
            </div>

            <button
              onClick={handleAnonymousSignIn}
              className="w-full gradient-primary text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-soft hover:shadow-soft-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <SparklesIcon className="h-6 w-6" />
              ゲストとして始める
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              ゲストモードは一時的なアカウントです。<br />
              複数デバイスで使うにはGoogleログインをご利用ください。
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover:shadow-soft-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`inline-flex p-3 ${feature.bgColor} rounded-xl mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              匿名認証で簡単にスタート • データは安全に保存されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
