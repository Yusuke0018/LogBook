'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getEntriesByUser } from '@/lib/services/entries';
import ThemeToggle from '@/components/ThemeToggle';
import TimelineView from '@/components/TimelineView';
import {
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import type { Entry } from '@/lib/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await getEntriesByUser(user.uid);
      setEntries(data);
    } catch (error) {
      console.error('エントリー読み込みエラー:', error);
      setErrorMessage('年表の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:bg-gray-900">
      <header className="glass sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                ダッシュボード
              </Link>
              <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  年表
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  今日を振り返っての記録を年単位で俯瞰します
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  1年〜数年の流れを横断して見返す
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  年表はPCで横スクロール、スマホでは縦に読みやすく並びます。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                  投稿数 {entries.length}件
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  年ジャンプ対応
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card p-10 text-center text-gray-500 dark:text-gray-400">
              読み込み中...
            </div>
          ) : errorMessage ? (
            <div className="card p-6 text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          ) : (
            <TimelineView entries={entries} />
          )}
        </div>
      </main>
    </div>
  );
}
