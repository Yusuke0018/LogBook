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
    <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <header className="glass sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                戻る
              </Link>
              <div className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-gray-700" />
              <p className="text-lg font-display font-bold text-gray-900 dark:text-white">
                年表
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden p-2">
        {loading ? (
          <div className="card h-full p-10 text-center text-gray-500 dark:text-gray-400">
            読み込み中...
          </div>
        ) : errorMessage ? (
          <div className="card h-full p-6 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : (
          <TimelineView entries={entries} className="h-full overflow-hidden" />
        )}
      </main>
    </div>
  );
}
