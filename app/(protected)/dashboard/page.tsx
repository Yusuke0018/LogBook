'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createEntry,
  updateEntry,
  deleteEntry,
  getEntriesByUser,
  getEntriesByDateRange,
  entryMatchesSearchTerm,
} from '@/lib/services/entries';
import {
  createMemo,
  deleteMemo,
  getTodayMemos,
} from '@/lib/services/memos';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import {
  entriesToText,
  entriesToCSV,
  downloadCSV,
  copyToClipboard,
} from '@/lib/utils/export';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import EntryForm from '@/components/EntryForm';
import EntryList from '@/components/EntryList';
import Calendar from '@/components/Calendar';
import ExportModal from '@/components/ExportModal';
import Toast from '@/components/Toast';
import InsightsPanel, {
  SummaryData,
  SummaryItem,
  MoodTrendPoint,
} from '@/components/InsightsPanel';
import QuickMemo from '@/components/QuickMemo';
import {
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import type { Entry, EntryFormData, Memo } from '@/lib/types';

type TrendPeriod = '7' | '30';

interface FiltersState {
  searchTerm: string;
  startDate: string;
  endDate: string;
}

const INITIAL_FILTERS: FiltersState = {
  searchTerm: '',
  startDate: '',
  endDate: '',
};

const filterEntries = (
  entries: Entry[],
  selectedDate: Date | undefined,
  filters: FiltersState
): Entry[] => {
  return entries.filter((entry) => {
    const entryDate = entry.createdAt.toDate();

    if (selectedDate && !isSameDay(entryDate, selectedDate)) {
      return false;
    }

    if (filters.startDate) {
      const start = startOfDay(new Date(filters.startDate));
      if (entryDate < start) return false;
    }

    if (filters.endDate) {
      const end = endOfDay(new Date(filters.endDate));
      if (entryDate > end) return false;
    }

    if (filters.searchTerm.trim()) {
      if (!entryMatchesSearchTerm(entry, filters.searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

const collectTopItems = (
  values: string[],
  limit = 5
): SummaryItem[] => {
  const counts = new Map<string, SummaryItem>();
  values
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      const existing = counts.get(value);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(value, { label: value, count: 1 });
      }
    });

  return Array.from(counts.values())
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.label.localeCompare(b.label, 'ja');
    })
    .slice(0, limit);
};

const createSummary = (title: string, entries: Entry[]): SummaryData => {
  const moodValues = entries
    .map((entry) => entry.mood)
    .filter((value): value is number => typeof value === 'number');

  const averageMood = moodValues.length
    ? Number(
        (
          moodValues.reduce((sum, value) => sum + value, 0) /
          moodValues.length
        ).toFixed(1)
      )
    : null;

  const tagValues = entries.flatMap((entry) => entry.tags || []);
  const weatherValues = entries
    .map((entry) => entry.weather)
    .filter((value): value is string => Boolean(value && value.trim()));

  return {
    title,
    entryCount: entries.length,
    averageMood,
    topTags: collectTopItems(tagValues),
    topWeather: collectTopItems(weatherValues, 3),
  };
};

const buildMoodTrend = (
  entries: Entry[],
  referenceDate: Date,
  period: number
): MoodTrendPoint[] => {
  const data: MoodTrendPoint[] = [];

  for (let i = period - 1; i >= 0; i -= 1) {
    const dayStart = startOfDay(addDays(referenceDate, -i));
    const dayEnd = endOfDay(dayStart);
    const dailyEntries = entries.filter((entry) => {
      const date = entry.createdAt.toDate();
      return date >= dayStart && date <= dayEnd;
    });

    const moodValues = dailyEntries
      .map((entry) => entry.mood)
      .filter((value): value is number => typeof value === 'number');

    const averageMood = moodValues.length
      ? Number(
          (
            moodValues.reduce((sum, value) => sum + value, 0) /
            moodValues.length
          ).toFixed(2)
        )
      : null;

    data.push({
      dateLabel: format(dayStart, period > 7 ? 'MM/dd' : 'MM/dd', {
        locale: ja,
      }),
      averageMood,
    });
  }

  return data;
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('7');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [memos, setMemos] = useState<Memo[]>([]);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);

  // Handle URL parameters from timeline
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const entryParam = searchParams.get('entry');

    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }

    if (entryParam) {
      setHighlightedEntryId(entryParam);
      // Scroll to entry after a delay to allow rendering
      setTimeout(() => {
        const entryElement = document.getElementById(`entry-${entryParam}`);
        if (entryElement) {
          entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      // Clear highlight after animation
      setTimeout(() => {
        setHighlightedEntryId(null);
      }, 3000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadEntries();
      loadMemos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const loadMemos = async () => {
    if (!user) return;
    try {
      const data = await getTodayMemos(user.uid);
      setMemos(data);
    } catch (error) {
      console.error('メモ読み込みエラー:', error);
    }
  };

  const handleCreateMemo = async (content: string, imageUrl?: string) => {
    if (!user) return;
    try {
      await createMemo(user.uid, { content, imageUrl });
      await loadMemos();
      showToast('メモを追加しました');
    } catch (error) {
      console.error('メモ作成エラー:', error);
      showToast('メモの作成に失敗しました', 'error');
    }
  };

  const handleDeleteMemo = async (memoId: string) => {
    try {
      await deleteMemo(memoId);
      await loadMemos();
      showToast('メモを削除しました');
    } catch (error) {
      console.error('メモ削除エラー:', error);
      showToast('メモの削除に失敗しました', 'error');
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

  const updateFilterValue = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSelectedDate(undefined);
  };

  const clearSelectedDate = () => {
    setSelectedDate(undefined);
  };

  const handleTrendPeriodChange = (period: TrendPeriod) => {
    setTrendPeriod(period);
  };

  const filteredEntries = useMemo(
    () => filterEntries(entries, selectedDate, filters),
    [entries, selectedDate, filters]
  );

  const filtersActive =
    Boolean(filters.searchTerm.trim()) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const referenceDate = useMemo(
    () => selectedDate ?? new Date(),
    [selectedDate]
  );
  const weekStart = useMemo(
    () => startOfWeek(referenceDate, { locale: ja }),
    [referenceDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(referenceDate, { locale: ja }),
    [referenceDate]
  );
  const monthStart = useMemo(() => startOfMonth(referenceDate), [referenceDate]);
  const monthEnd = useMemo(() => endOfMonth(referenceDate), [referenceDate]);

  const dailyEntries = useMemo(
    () =>
      entries.filter((entry) =>
        isSameDay(entry.createdAt.toDate(), referenceDate)
      ),
    [entries, referenceDate]
  );

  const weeklyEntries = useMemo(() => {
    const start = startOfDay(weekStart);
    const end = endOfDay(weekEnd);
    return entries.filter((entry) => {
      const date = entry.createdAt.toDate();
      return date >= start && date <= end;
    });
  }, [entries, weekStart, weekEnd]);

  const monthlyEntries = useMemo(() => {
    const start = startOfDay(monthStart);
    const end = endOfDay(monthEnd);
    return entries.filter((entry) => {
      const date = entry.createdAt.toDate();
      return date >= start && date <= end;
    });
  }, [entries, monthStart, monthEnd]);

  const dailySummary = useMemo(
    () =>
      createSummary(
        format(referenceDate, 'MM月dd日 (EEE)', { locale: ja }),
        dailyEntries
      ),
    [dailyEntries, referenceDate]
  );

  const weeklySummary = useMemo(() => {
    const title = `週次 ${format(weekStart, 'MM/dd', {
      locale: ja,
    })}〜${format(weekEnd, 'MM/dd', { locale: ja })}`;
    return createSummary(title, weeklyEntries);
  }, [weekStart, weekEnd, weeklyEntries]);

  const monthlySummary = useMemo(() => {
    const title = `月次 ${format(monthStart, 'yyyy年MM月', {
      locale: ja,
    })}`;
    return createSummary(title, monthlyEntries);
  }, [monthStart, monthlyEntries]);

  const moodTrendData = useMemo(
    () => buildMoodTrend(entries, referenceDate, Number(trendPeriod)),
    [entries, referenceDate, trendPeriod]
  );

  const entryDates = useMemo(
    () => entries.map((entry) => entry.createdAt.toDate()),
    [entries]
  );

  const listTitle = selectedDate
    ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja })
    : filtersActive
    ? '条件に一致する投稿'
    : 'すべての投稿';

  const isFilteredView = filtersActive || Boolean(selectedDate);

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
              <Link
                href="/future-letter"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <EnvelopeIcon className="h-5 w-5" />
                未来への手紙
              </Link>
              <Link
                href="/timeline"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-button hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                年表
              </Link>
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
                  {editingEntry ? '投稿を編集' : '今日を振り返って'}
                </h2>
              </div>
              <EntryForm
                onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
                initialData={editingEntry || undefined}
                submitLabel={editingEntry ? '更新' : '投稿'}
                onCancel={editingEntry ? handleCancelEdit : undefined}
                userId={user?.uid}
              />
            </div>

            {/* Filters Card */}
            <div className="card p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    検索とフィルタ
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    キーワードと日付で過去ログを素早く探せます
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={clearSelectedDate}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      日付フィルタ解除
                    </button>
                  )}
                  {filtersActive && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full hover:from-primary-600 hover:to-secondary-600"
                    >
                      条件リセット
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    キーワード検索
                  </label>
                  <input
                    type="search"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilterValue('searchTerm', e.target.value)}
                    placeholder="タイトルや本文を部分一致で検索"
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    例: 「会議」や「ランニング」を入力すると該当する投稿だけ表示します。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => updateFilterValue('startDate', e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      終了日
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => updateFilterValue('endDate', e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Memos Section - 日々の断片 */}
            {memos.length > 0 && (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl">
                    <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    日々の断片
                    <span className="ml-2 text-sm font-normal text-gray-500">({memos.length})</span>
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {memos.map((memo) => (
                    <div
                      key={memo.id}
                      className="group relative p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl"
                    >
                      {memo.imageUrl && (
                        <img
                          src={memo.imageUrl}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      {memo.content && (
                        <p className="text-sm text-gray-700 dark:text-gray-200 break-words pr-6">
                          {memo.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {format(memo.createdAt.toDate(), 'HH:mm', { locale: ja })}
                      </p>
                      <button
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all bg-white/80 dark:bg-gray-800/80 rounded-full"
                        title="削除"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                        {listTitle}
                      </h2>
                      {isFilteredView && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                          フィルタ中
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {filteredEntries.length}件の投稿
                      {isFilteredView && (
                        <span className="ml-1 text-gray-400 dark:text-gray-500">
                          / 全{entries.length}件
                        </span>
                      )}
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
                highlightedEntryId={highlightedEntryId}
              />
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Calendar
                entryDates={entryDates}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
              <InsightsPanel
                daily={dailySummary}
                weekly={weeklySummary}
                monthly={monthlySummary}
                moodTrend={moodTrendData}
                trendPeriod={trendPeriod}
                onTrendPeriodChange={handleTrendPeriodChange}
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

      <QuickMemo
        memos={memos}
        onSubmit={handleCreateMemo}
        onDelete={handleDeleteMemo}
        userId={user?.uid}
      />
    </div>
  );
}
