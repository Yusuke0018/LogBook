'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createFutureLetter,
  openFutureLetter,
  deleteFutureLetter,
  getDeliveredLetters,
  getPendingLetters,
} from '@/lib/services/futureLetters';
import FutureLetterForm from '@/components/FutureLetterForm';
import FutureLetterList from '@/components/FutureLetterList';
import Toast from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';
import type { FutureLetter, FutureLetterFormData } from '@/lib/types';

export const dynamic = 'force-dynamic';

type TabType = 'read' | 'write';

export default function FutureLetterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('read');
  const [deliveredLetters, setDeliveredLetters] = useState<FutureLetter[]>([]);
  const [pendingLetters, setPendingLetters] = useState<FutureLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [debugMode, setDebugMode] = useState(false);

  const unopenedCount = deliveredLetters.filter(l => !l.isOpened).length;

  useEffect(() => {
    if (user) {
      loadLetters();
    }
  }, [user]);

  const loadLetters = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [delivered, pending] = await Promise.all([
        getDeliveredLetters(user.uid),
        getPendingLetters(user.uid),
      ]);
      setDeliveredLetters(delivered);
      setPendingLetters(pending);
    } catch (error) {
      console.error('手紙の読み込みエラー:', error);
      showToast('手紙の読み込みに失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLetter = async (data: FutureLetterFormData) => {
    if (!user) return;
    try {
      await createFutureLetter(user.uid, data);
      await loadLetters();
      showToast('未来への手紙を送りました');
      setActiveTab('read');
    } catch (error) {
      console.error('手紙作成エラー:', error);
      showToast('手紙の送信に失敗しました', 'error');
    }
  };

  const handleOpenLetter = async (letterId: string) => {
    try {
      await openFutureLetter(letterId);
      await loadLetters();
    } catch (error) {
      console.error('手紙開封エラー:', error);
      showToast('手紙の開封に失敗しました', 'error');
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    try {
      await deleteFutureLetter(letterId);
      await loadLetters();
      showToast('手紙を削除しました');
    } catch (error) {
      console.error('手紙削除エラー:', error);
      showToast('手紙の削除に失敗しました', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft">
                  <EnvelopeIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  未来への手紙
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  debugMode
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <BugAntIcon className="h-4 w-4" />
                {debugMode ? 'DEBUG ON' : 'DEBUG'}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'read'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-soft'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <EnvelopeIcon className="h-5 w-5" />
            手紙を読む
            {unopenedCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unopenedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-soft'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PencilSquareIcon className="h-5 w-5" />
            手紙を書く
          </button>
        </div>

        {/* Content */}
        {activeTab === 'write' ? (
          <div className="card p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
                <PencilSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  未来への手紙を書く
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ランダムな日に届きます。届くまでお楽しみに。
                </p>
              </div>
            </div>
            <FutureLetterForm onSubmit={handleCreateLetter} />
          </div>
        ) : (
          <div className="animate-fade-in">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                読み込み中...
              </div>
            ) : (
              <FutureLetterList
                deliveredLetters={deliveredLetters}
                pendingLetters={pendingLetters}
                onOpen={handleOpenLetter}
                onDelete={handleDeleteLetter}
                debugMode={debugMode}
              />
            )}
          </div>
        )}
      </main>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}
