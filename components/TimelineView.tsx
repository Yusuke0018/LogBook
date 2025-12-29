'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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

  const rootClassName = `card p-3 animate-fade-in flex flex-col min-h-0${
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
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {/* Compact Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">年表</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {startYear}-{currentYear} / {entriesInRange.length}件
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Range buttons */}
            <div className="flex gap-1">
              {RANGE_OPTIONS.map((option) => {
                const isActive = rangeYears === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRangeYears(option.value)}
                    className={
                      isActive
                        ? 'px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full'
                        : 'px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-primary-600 transition'
                    }
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {/* Year jump */}
            <select
              id="timeline-year-jump"
              onChange={(event) => handleJumpToYear(Number(event.target.value))}
              className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              {yearsInRange.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            {/* Scroll buttons */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="左へスクロール"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="右へスクロール"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-3 py-1">
                        <span className={`text-sm font-bold ${isCurrentYear ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                          {year}年
                        </span>
                      </div>

                      {/* Months Row */}
                      <div className="flex h-[calc(100%-28px)]">
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
                              <div className={`px-2 py-1 border-b border-gray-100 dark:border-gray-800 ${
                                isCurrentMonth ? 'bg-primary-100/50 dark:bg-primary-900/20' : 'bg-gray-50/50 dark:bg-gray-800/30'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-semibold ${
                                    isCurrentMonth ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {monthData.month + 1}月
                                  </span>
                                  {monthData.entryCount > 0 && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {monthData.entryCount}
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
                                          {dayGroup.entries.map((entry) => {
                                            const dateParam = format(entry.createdAt.toDate(), 'yyyy-MM-dd');
                                            return (
                                              <Link
                                                key={entry.id}
                                                href={`/dashboard?date=${dateParam}&entry=${entry.id}`}
                                                className="block text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-900/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:ring-1 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all cursor-pointer"
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
                                              </Link>
                                            );
                                          })}
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
