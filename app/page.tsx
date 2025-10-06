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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
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
          <div className="glass rounded-3xl shadow-soft-lg p-8 mb-8 animate-slide-up">
            <button
              onClick={handleSignIn}
              className="w-full gradient-primary text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-soft hover:shadow-soft-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <SparklesIcon className="h-6 w-6" />
              ログインして始める
            </button>
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
