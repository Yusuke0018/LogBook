'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Entry } from '@/lib/types';
import { MOOD_EMOJI_MAP } from '@/lib/constants/entry';

type RangeOption = 1 | 3 | 5;

interface DayGroup {
  date: Date;
  entries: Entry[];
}

interface MonthData {
  year: number;
  month: number;
  days: DayGroup[];
  entryCount: number;
}

const RANGE_OPTIONS: Array<{ value: RangeOption; label: string }> = [
  { value: 1, label: '1年' },
  { value: 3, label: '3年' },
  { value: 5, label: '5年' },
];

const buildSnippet = (content: string, maxLength = 80) => {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
};

interface TimelineViewProps {
  entries: Entry[];
  className?: string;
}

export default function TimelineView({ entries, className }: TimelineViewProps) {
  const [rangeYears, setRangeYears] = useState<RangeOption>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startYear = currentYear - (rangeYears - 1);
  const today = useMemo(() => startOfDay(new Date()), []);

  const rootClassName = `card p-6 animate-fade-in flex flex-col min-h-0${
    className ? ` ${className}` : ''
  }`;

  const entriesInRange = useMemo(
    () =>
      entries.filter((entry) => {
        const year = entry.createdAt.toDate().getFullYear();
        return year >= startYear && year <= currentYear;
      }),
    [entries, startYear, currentYear]
  );

  // Build flat month array for horizontal timeline
  const timelineMonths = useMemo<MonthData[]>(() => {
    // Create a map for quick lookup
    const monthMap = new Map<string, { days: Map<string, DayGroup> }>();

    entriesInRange.forEach((entry) => {
      const date = entry.createdAt.toDate();
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month}`;
      const dayKey = format(date, 'yyyy-MM-dd');

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { days: new Map() });
      }

      const monthData = monthMap.get(monthKey)!;
      if (!monthData.days.has(dayKey)) {
        monthData.days.set(dayKey, { date: startOfDay(date), entries: [] });
      }

      monthData.days.get(dayKey)!.entries.push(entry);
    });

    // Generate all months in range (oldest to newest for left-to-right timeline)
    const months: MonthData[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      const startMonth = 0;
      const endMonth = year === currentYear ? currentMonth : 11;

      for (let month = startMonth; month <= endMonth; month++) {
        const monthKey = `${year}-${month}`;
        const monthData = monthMap.get(monthKey);
        const days = monthData
          ? Array.from(monthData.days.values()).sort(
              (a, b) => a.date.getTime() - b.date.getTime()
            )
          : [];
        const entryCount = days.reduce((sum, day) => sum + day.entries.length, 0);

        months.push({
          year,
          month,
          days,
          entryCount,
        });
      }
    }

    return months;
  }, [entriesInRange, startYear, currentYear, currentMonth]);

  // Get unique years for header
  const yearsInRange = useMemo(() => {
    const years: number[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }, [startYear, currentYear]);

  // Scroll to current month on mount
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to end (current month) after render
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [rangeYears]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleJumpToYear = (year: number) => {
    const target = document.getElementById(`timeline-month-${year}-0`);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  };

  return (
    <section className={rootClassName}>
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
              <CalendarDaysIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                年表で振り返る
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                左から右へ時間が流れます。横スクロールで移動できます。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              {startYear} - {currentYear}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
              {entriesInRange.length}件
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => {
              const isActive = rangeYears === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRangeYears(option.value)}
                  className={
                    isActive
                      ? 'px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-soft'
                      : 'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-300 transition'
                  }
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="timeline-year-jump"
              className="text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              年ジャンプ
            </label>
            <select
              id="timeline-year-jump"
              onChange={(event) => handleJumpToYear(Number(event.target.value))}
              className="px-3 py-2 text-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {yearsInRange.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            {/* Scroll buttons */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="左へスクロール"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="右へスクロール"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {entriesInRange.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            表示期間に投稿がありません
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* Timeline Container */}
            <div
              ref={scrollRef}
              className="h-full overflow-x-auto overflow-y-hidden scrollbar-thin"
            >
              <div className="inline-flex h-full min-w-full">
                {/* Year sections */}
                {yearsInRange.map((year) => {
                  const yearMonths = timelineMonths.filter((m) => m.year === year);
                  const isCurrentYear = year === currentYear;

                  return (
                    <div
                      key={year}
                      id={`timeline-year-${year}`}
                      className="flex-shrink-0"
                    >
                      {/* Year Header */}
                      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                        <span className={`text-lg font-bold ${isCurrentYear ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                          {year}年
                        </span>
                      </div>

                      {/* Months Row */}
                      <div className="flex h-[calc(100%-44px)]">
                        {yearMonths.map((monthData) => {
                          const isCurrentMonth = monthData.year === currentYear && monthData.month === currentMonth;

                          return (
                            <div
                              key={`${monthData.year}-${monthData.month}`}
                              id={`timeline-month-${monthData.year}-${monthData.month}`}
                              className={`flex-shrink-0 w-48 border-r border-gray-100 dark:border-gray-800 flex flex-col ${
                                isCurrentMonth ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                              }`}
                            >
                              {/* Month Header */}
                              <div className={`px-3 py-2 border-b border-gray-100 dark:border-gray-800 ${
                                isCurrentMonth ? 'bg-primary-100/50 dark:bg-primary-900/20' : 'bg-gray-50/50 dark:bg-gray-800/30'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-semibold ${
                                    isCurrentMonth ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {monthData.month + 1}月
                                  </span>
                                  {monthData.entryCount > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {monthData.entryCount}件
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Days/Entries */}
                              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                                {monthData.days.length === 0 ? (
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
                                  </div>
                                ) : (
                                  monthData.days.map((dayGroup) => {
                                    const isToday = isSameDay(dayGroup.date, today);
                                    return (
                                      <div
                                        key={dayGroup.date.toISOString()}
                                        className={`rounded-lg p-2 ${
                                          isToday
                                            ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400'
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-xs font-semibold ${
                                            isToday ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                                          }`}>
                                            {format(dayGroup.date, 'd日 (E)', { locale: ja })}
                                          </span>
                                          {isToday && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-primary-500 text-white rounded">
                                              今日
                                            </span>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          {dayGroup.entries.map((entry) => (
                                            <div
                                              key={entry.id}
                                              className="text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-900/50"
                                            >
                                              <div className="flex items-start justify-between gap-1">
                                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                                  {entry.title || '無題'}
                                                </span>
                                                {typeof entry.mood === 'number' && (
                                                  <span className="flex-shrink-0">
                                                    {MOOD_EMOJI_MAP[entry.mood] || '🙂'}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                {buildSnippet(entry.content, 50)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
