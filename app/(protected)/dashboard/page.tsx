'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createEntry,
  deleteEntry,
  getEntriesByUser,
  getEntriesByDateRange,
} from '@/lib/services/entries';
import {
  entriesToText,
  entriesToCSV,
  downloadCSV,
  copyToClipboard,
} from '@/lib/utils/export';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import EntryForm from '@/components/EntryForm';
import EntryList from '@/components/EntryList';
import Calendar from '@/components/Calendar';
import ExportModal from '@/components/ExportModal';
import Toast from '@/components/Toast';
import {
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import type { Entry, EntryFormData } from '@/lib/types';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = entries.filter((entry) => {
        const entryDate = entry.createdAt.toDate();
        return (
          format(entryDate, 'yyyy-MM-dd') ===
          format(selectedDate, 'yyyy-MM-dd')
        );
      });
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(entries);
    }
  }, [entries, selectedDate]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const data = await getEntriesByUser(user.uid);
      setEntries(data);
    } catch (error) {
      console.error('エントリー読み込みエラー:', error);
      showToast('エントリーの読み込みに失敗しました', 'error');
    }
  };

  const handleCreateEntry = async (data: EntryFormData) => {
    if (!user) return;
    try {
      await createEntry(user.uid, data);
      await loadEntries();
      showToast('投稿が作成されました');
    } catch (error) {
      console.error('投稿エラー:', error);
      showToast('投稿の作成に失敗しました', 'error');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('本当に削除しますか?')) return;
    try {
      await deleteEntry(entryId);
      await loadEntries();
      showToast('投稿が削除されました');
    } catch (error) {
      console.error('削除エラー:', error);
      showToast('投稿の削除に失敗しました', 'error');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = entriesToText(filteredEntries);
      await copyToClipboard(text);
      showToast('クリップボードにコピーしました');
    } catch (error) {
      console.error('コピーエラー:', error);
      showToast('コピーに失敗しました', 'error');
    }
  };

  const handleExport = async (startDate: Date, endDate: Date) => {
    if (!user) return;
    try {
      const data = await getEntriesByDateRange(user.uid, startDate, endDate);
      const csv = entriesToCSV(data);
      const filename = `logbook_${format(startDate, 'yyyyMMdd')}_${format(
        endDate,
        'yyyyMMdd'
      )}.csv`;
      downloadCSV(csv, filename);
      showToast('CSVをダウンロードしました');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      showToast('エクスポートに失敗しました', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const entryDates = entries.map((entry) => entry.createdAt.toDate());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            LogBook
          </h1>
          <button
            onClick={signOut}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            ログアウト
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                新しい投稿
              </h2>
              <EntryForm onSubmit={handleCreateEntry} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedDate
                    ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja })
                    : 'すべての投稿'}
                  （{filteredEntries.length}件）
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={filteredEntries.length === 0}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="クリップボードにコピー"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="CSVエクスポート"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <EntryList
                entries={filteredEntries}
                onDelete={handleDeleteEntry}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Calendar
              entryDates={entryDates}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </main>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}
