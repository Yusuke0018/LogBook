'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createEntry,
  updateEntry,
  deleteEntry,
  getEntriesByUser,
  getEntriesByDateRange,
} from '@/lib/services/entries';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
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
import ThemeToggle from '@/components/ThemeToggle';
import type { Entry, EntryFormData } from '@/lib/types';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
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

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    // スクロールしてフォームに移動
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateEntry = async (data: EntryFormData) => {
    if (!editingEntry) return;
    try {
      await updateEntry(editingEntry.id, data);
      await loadEntries();
      setEditingEntry(null);
      showToast('投稿が更新されました');
    } catch (error) {
      console.error('更新エラー:', error);
      showToast('投稿の更新に失敗しました', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('本当に削除しますか?')) return;
    try {
      await deleteEntry(entryId);
      await loadEntries();
      if (editingEntry?.id === entryId) {
        setEditingEntry(null);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:bg-gray-900">
      {/* Header with clean design */}
      <header className="glass sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                LogBook
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* New Entry Card */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {editingEntry ? '投稿を編集' : '新しい投稿'}
                </h2>
              </div>
              <EntryForm
                onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
                initialData={editingEntry || undefined}
                submitLabel={editingEntry ? '更新' : '投稿'}
                onCancel={editingEntry ? handleCancelEdit : undefined}
              />
            </div>

            {/* Entries List Card */}
            <div className="card p-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-secondary-100 to-accent-100 dark:from-secondary-900/30 dark:to-accent-900/30 rounded-2xl">
                    <svg className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                      {selectedDate
                        ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja })
                        : 'すべての投稿'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {filteredEntries.length}件の投稿
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={filteredEntries.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-button hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="クリップボードにコピー"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">コピー</span>
                  </button>
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-button hover:shadow-soft-lg hover:from-primary-600 hover:to-secondary-600 transition-all"
                    title="CSVエクスポート"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
              </div>
              <EntryList
                entries={filteredEntries}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Calendar
                entryDates={entryDates}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
            </div>
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
