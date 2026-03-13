'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createLearning,
  deleteLearning,
  getLearningsByUser,
  learningMatchesSearch,
} from '@/lib/services/learnings';
import {
  learningsToText,
  learningsToCSV,
  downloadCSV,
  copyToClipboard,
} from '@/lib/utils/export';
import { format } from 'date-fns';
import LearningForm from '@/components/LearningForm';
import LearningList from '@/components/LearningList';
import Toast from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import {
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import type { Learning } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (user) loadLearnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadLearnings = async () => {
    if (!user) return;
    try {
      const data = await getLearningsByUser(user.uid);
      setLearnings(data);
    } catch (error) {
      console.error('読み込みエラー:', error);
      showToast('読み込みに失敗しました', 'error');
    }
  };

  const handleCreate = async (content: string, tags: string[], source: string, date: string) => {
    if (!user) return;
    try {
      await createLearning(user.uid, { content, tags, source, date: date || undefined });
      await loadLearnings();
      showToast('保存しました');
    } catch (error) {
      console.error('保存エラー:', error);
      showToast('保存に失敗しました', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLearning(id);
      await loadLearnings();
      showToast('削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  const filtered = useMemo(
    () => learnings.filter((l) => learningMatchesSearch(l, searchTerm)),
    [learnings, searchTerm]
  );

  const handleCopy = async () => {
    try {
      await copyToClipboard(learningsToText(filtered));
      showToast('コピーしました');
    } catch {
      showToast('コピーに失敗しました', 'error');
    }
  };

  const handleCSV = () => {
    const csv = learningsToCSV(filtered);
    downloadCSV(csv, `logbook_${format(new Date(), 'yyyyMMdd')}.csv`);
    showToast('CSVをダウンロードしました');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="transparent-header sticky top-[52px] z-10">
        <div className="container mx-auto px-3 sm:px-6 py-3">
          <div className="flex justify-between items-center gap-2">
            <div className="header-item flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl shadow-soft">
                <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                LogBook
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="header-btn !px-2 sm:!px-4">
                <ThemeToggle />
              </div>
              <button
                onClick={signOut}
                className="header-btn inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all !px-2 sm:!px-4"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        {/* Form */}
        <div className="card p-6 sm:p-8 mb-6 animate-fade-in">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">
            学びを記録
          </h2>
          <LearningForm onSubmit={handleCreate} />
        </div>

        {/* Search + Export */}
        <div className="card p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="キーワード・タグで検索"
                className="w-full pl-9 pr-4 py-2.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopy}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-button hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                <span className="hidden sm:inline">コピー</span>
              </button>
              <button
                onClick={handleCSV}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-button hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {filtered.length}件{searchTerm && ` / 全${learnings.length}件`}
          </p>
        </div>

        {/* List */}
        <div className="card p-6 sm:p-8 animate-slide-up">
          <LearningList
            learnings={filtered}
            onDelete={handleDelete}
            onTagClick={handleTagClick}
          />
        </div>
      </main>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}
