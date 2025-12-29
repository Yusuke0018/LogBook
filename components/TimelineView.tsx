'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { Entry } from '@/lib/types';
import { MOOD_EMOJI_MAP, MOOD_LABEL_MAP } from '@/lib/constants/entry';

type RangeOption = 1 | 3 | 5;

interface DayGroup {
  date: Date;
  entries: Entry[];
}

interface MonthGroup {
  month: number;
  days: DayGroup[];
  entryCount: number;
}

interface YearGroup {
  year: number;
  months: MonthGroup[];
  entryCount: number;
}

const RANGE_OPTIONS: Array<{ value: RangeOption; label: string }> = [
  { value: 1, label: '1年' },
  { value: 3, label: '3年' },
  { value: 5, label: '5年' },
];

const buildSnippet = (content: string, maxLength = 100) => {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
};

const summarizeTags = (tags?: string[]) => {
  const cleaned = (tags || [])
    .map((tag) => tag.trim())
    .filter(Boolean);
  return {
    visible: cleaned.slice(0, 3),
    extraCount: Math.max(cleaned.length - 3, 0),
  };
};

interface TimelineViewProps {
  entries: Entry[];
}

export default function TimelineView({ entries }: TimelineViewProps) {
  const [rangeYears, setRangeYears] = useState<RangeOption>(1);
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = currentYear - (rangeYears - 1);
  const today = useMemo(() => startOfDay(new Date()), []);

  const entriesInRange = useMemo(
    () =>
      entries.filter((entry) => {
        const year = entry.createdAt.toDate().getFullYear();
        return year >= startYear && year <= currentYear;
      }),
    [entries, startYear, currentYear]
  );

  const timelineYears = useMemo<YearGroup[]>(() => {
    const yearMap = new Map<
      number,
      Map<number, Map<string, { date: Date; entries: Entry[] }>>
    >();

    const sortedEntries = entriesInRange
      .map((entry) => ({ entry, date: entry.createdAt.toDate() }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    sortedEntries.forEach(({ entry, date }) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const dayKey = format(date, 'yyyy-MM-dd');
      let monthMap = yearMap.get(year);
      if (!monthMap) {
        monthMap = new Map();
        yearMap.set(year, monthMap);
      }
      let dayMap = monthMap.get(month);
      if (!dayMap) {
        dayMap = new Map();
        monthMap.set(month, dayMap);
      }
      let dayGroup = dayMap.get(dayKey);
      if (!dayGroup) {
        dayGroup = { date: startOfDay(date), entries: [] };
        dayMap.set(dayKey, dayGroup);
      }
      dayGroup.entries.push(entry);
    });

    const years: YearGroup[] = [];
    for (let year = currentYear; year >= startYear; year -= 1) {
      const monthMap = yearMap.get(year);
      const months: MonthGroup[] = monthMap
        ? Array.from(monthMap.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([month, dayMap]) => {
              const days = Array.from(dayMap.values()).sort(
                (a, b) => b.date.getTime() - a.date.getTime()
              );
              const entryCount = days.reduce(
                (sum, day) => sum + day.entries.length,
                0
              );
              return {
                month,
                days,
                entryCount,
              };
            })
        : [];

      const entryCount = months.reduce(
        (sum, month) => sum + month.entryCount,
        0
      );

      years.push({ year, months, entryCount });
    }

    return years;
  }, [entriesInRange, currentYear, startYear]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = currentYear; year >= startYear; year -= 1) {
      years.push(year);
    }
    return years;
  }, [currentYear, startYear]);

  const [jumpYear, setJumpYear] = useState<number>(currentYear);

  useEffect(() => {
    if (!yearOptions.includes(jumpYear)) {
      setJumpYear(yearOptions[0] ?? currentYear);
    }
  }, [yearOptions, jumpYear, currentYear]);

  const handleJumpToYear = (year: number) => {
    setJumpYear(year);
    const target = document.getElementById(`timeline-year-${year}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="card p-8 animate-fade-in">
      <div className="flex flex-col gap-6">
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
                今日を振り返っての投稿を、年単位の流れで俯瞰します。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              表示期間: {startYear} - {currentYear}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
              {entriesInRange.length}件の投稿
            </span>
          </div>
        </div>

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
              value={jumpYear}
              onChange={(event) => handleJumpToYear(Number(event.target.value))}
              className="px-3 py-2 text-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">
          PCでは横スクロールで年を移動できます。
        </p>

        {entriesInRange.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            表示期間に投稿がありません
          </div>
        ) : (
          <div className="space-y-12 lg:space-y-0 lg:flex lg:gap-10 lg:overflow-x-auto lg:pb-4 lg:pr-4">
            {timelineYears.map((yearGroup) => (
              <section
                key={yearGroup.year}
                id={`timeline-year-${yearGroup.year}`}
                className="scroll-mt-28 lg:min-w-[360px] lg:max-w-[420px] lg:shrink-0"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                      {yearGroup.year}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {yearGroup.entryCount}件の投稿
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {yearGroup.months.length === 0
                      ? 'この年の投稿はまだありません'
                      : `${yearGroup.months.length}ヶ月分`}
                  </div>
                </div>

                {yearGroup.months.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                    まだこの年の記録がありません。次の振り返りで埋めていきましょう。
                  </div>
                ) : (
                  <div className="mt-6 space-y-8">
                    {yearGroup.months.map((monthGroup) => (
                      <div
                        key={`${yearGroup.year}-${monthGroup.month}`}
                        className="relative pl-6 sm:pl-10"
                      >
                        <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {format(
                              new Date(yearGroup.year, monthGroup.month, 1),
                              'MM月',
                              { locale: ja }
                            )}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {monthGroup.entryCount}件
                          </span>
                        </div>
                        <div className="space-y-4">
                          {monthGroup.days.map((dayGroup) => {
                            const isToday = isSameDay(dayGroup.date, today);
                            return (
                              <div
                                key={dayGroup.date.toISOString()}
                                className="relative pl-6 sm:pl-8"
                              >
                                <span
                                  className={
                                    isToday
                                      ? 'absolute left-1.5 sm:left-2.5 top-6 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-200 dark:ring-primary-900/40'
                                      : 'absolute left-1.5 sm:left-2.5 top-6 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600'
                                  }
                                ></span>
                                <div
                                  className={
                                    isToday
                                      ? 'rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-900/20 p-5 shadow-soft'
                                      : 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/30 p-5 shadow-soft'
                                  }
                                >
                                  <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                      {format(dayGroup.date, 'MM/dd (EEE)', {
                                        locale: ja,
                                      })}
                                    </p>
                                    {isToday && (
                                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary-500 text-white">
                                        今日
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {dayGroup.entries.length}件
                                    </span>
                                  </div>

                                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {dayGroup.entries.map((entry) => {
                                      const tags = summarizeTags(entry.tags);
                                      return (
                                        <div
                                          key={entry.id}
                                          className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/60 p-4"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div>
                                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {entry.title || '無題'}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {format(
                                                  entry.createdAt.toDate(),
                                                  'HH:mm',
                                                  { locale: ja }
                                                )}
                                              </p>
                                            </div>
                                            {typeof entry.mood === 'number' && (
                                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-200 rounded-full">
                                                <span aria-hidden>
                                                  {MOOD_EMOJI_MAP[entry.mood] ||
                                                    '🙂'}
                                                </span>
                                                {MOOD_LABEL_MAP[entry.mood] ||
                                                  entry.mood}
                                              </span>
                                            )}
                                          </div>

                                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {buildSnippet(entry.content)}
                                          </p>

                                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            {tags.visible.map((tag) => (
                                              <span
                                                key={tag}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                            {tags.extraCount > 0 && (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                                +{tags.extraCount}
                                              </span>
                                            )}
                                            {entry.weather && (
                                              <span className="inline-flex items-center gap-1">
                                                🌤️ {entry.weather}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
