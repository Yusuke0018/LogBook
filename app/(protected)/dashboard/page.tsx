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
  entryMatchesSearchTerm,
} from '@/lib/services/entries';
import {
  createMemo,
  deleteMemo,
  getMemosByUser,
} from '@/lib/services/memos';
import { getUnreadLettersCount } from '@/lib/services/futureLetters';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import {
  entriesToText,
  downloadCSV,
  copyToClipboard,
  unifiedToCSV,
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
import UnifiedList, { UnifiedItem } from '@/components/UnifiedList';
import Calendar from '@/components/Calendar';
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
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [memos, setMemos] = useState<Memo[]>([]);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
  const [unreadLettersCount, setUnreadLettersCount] = useState(0);

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
      loadUnreadLettersCount();
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
      const data = await getMemosByUser(user.uid, 10000);
      setMemos(data);
    } catch (error) {
      console.error('メモ読み込みエラー:', error);
    }
  };

  const loadUnreadLettersCount = async () => {
    if (!user) return;
    try {
      const count = await getUnreadLettersCount(user.uid);
      setUnreadLettersCount(count);
    } catch (error) {
      console.error('未読手紙数取得エラー:', error);
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

  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      const memoDate = memo.createdAt.toDate();

      if (selectedDate && !isSameDay(memoDate, selectedDate)) {
        return false;
      }

      if (filters.startDate) {
        const start = startOfDay(new Date(filters.startDate));
        if (memoDate < start) return false;
      }

      if (filters.endDate) {
        const end = endOfDay(new Date(filters.endDate));
        if (memoDate > end) return false;
      }

      if (filters.searchTerm.trim()) {
        if (!memo.content.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [memos, selectedDate, filters]);

  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [
      ...filteredEntries.map((entry) => ({ type: 'entry' as const, data: entry })),
      ...filteredMemos.map((memo) => ({ type: 'memo' as const, data: memo })),
    ];
    return items.sort((a, b) => {
      const dateA = a.data.createdAt.toDate().getTime();
      const dateB = b.data.createdAt.toDate().getTime();
      return dateB - dateA;
    });
  }, [filteredEntries, filteredMemos]);

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
    ? '条件に一致する記録'
    : 'すべての記録';

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Header with transparent design */}
      <header className="transparent-header sticky top-[52px] z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="header-item flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                LogBook
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/future-letter"
                className="header-btn relative inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
              >
                <EnvelopeIcon className="h-5 w-5" />
                未来への手紙
                {unreadLettersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {unreadLettersCount}
                  </span>
                )}
              </Link>
              <Link
                href="/timeline"
                className="header-btn inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                年表
              </Link>
              <div className="header-btn">
                <ThemeToggle />
              </div>
              <button
                onClick={signOut}
                className="header-btn inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
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

            {/* Unified List Card - 投稿と断片を時間順に表示 */}
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
                      {unifiedItems.length}件の記録
                      <span className="ml-1 text-gray-400 dark:text-gray-500">
                        (投稿 {filteredEntries.length} / 断片 {filteredMemos.length})
                      </span>
                      {isFilteredView && (
                        <span className="ml-1 text-gray-400 dark:text-gray-500">
                          / 全{entries.length + memos.length}件
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
                    onClick={() => {
                      const csv = unifiedToCSV(filteredEntries, filteredMemos);
                      const filename = `logbook_${format(new Date(), 'yyyyMMdd')}.csv`;
                      downloadCSV(csv, filename);
                      showToast('CSVをダウンロードしました');
                    }}
                    disabled={unifiedItems.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-button hover:shadow-soft-lg hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="CSVエクスポート"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
              </div>
              <UnifiedList
                items={unifiedItems}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onDeleteMemo={handleDeleteMemo}
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
