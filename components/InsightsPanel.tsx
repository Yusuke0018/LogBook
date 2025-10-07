'use client';

import MoodTrendChart, { MoodTrendPoint } from './MoodTrendChart';
export type { MoodTrendPoint } from './MoodTrendChart';
import { MOOD_LABEL_MAP } from '@/lib/constants/entry';

export interface SummaryItem {
  label: string;
  count: number;
}

export interface SummaryData {
  title: string;
  entryCount: number;
  averageMood: number | null;
  topTags: SummaryItem[];
  topWeather: SummaryItem[];
}

interface InsightsPanelProps {
  daily: SummaryData;
  weekly: SummaryData;
  monthly: SummaryData;
  moodTrend: MoodTrendPoint[];
  trendPeriod: '7' | '30';
  onTrendPeriodChange: (period: '7' | '30') => void;
}

const SUMMARY_SECTIONS: Array<'topTags' | 'topWeather'> = [
  'topTags',
  'topWeather',
];

const SECTION_LABEL: Record<(typeof SUMMARY_SECTIONS)[number], string> = {
  topTags: 'タグ上位',
  topWeather: '天気上位',
};

export default function InsightsPanel({
  daily,
  weekly,
  monthly,
  moodTrend,
  trendPeriod,
  onTrendPeriodChange,
}: InsightsPanelProps) {
  const summaries = [daily, weekly, monthly];

  return (
    <div className="card p-6 space-y-6 animate-slide-up overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            気分トレンド
          </h3>
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            {([
              { value: '7', label: '7日間' },
              { value: '30', label: '30日間' },
            ] as const).map((option) => {
              const isActive = trendPeriod === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onTrendPeriodChange(option.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                  }`}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <MoodTrendChart data={moodTrend} />
      </div>

      <div className="space-y-4">
        {summaries.map((summary) => (
          <SummaryCard key={summary.title} summary={summary} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ summary }: { summary: SummaryData }) {
  const roundedMood =
    typeof summary.averageMood === 'number'
      ? summary.averageMood.toFixed(1)
      : null;
  const moodLabel =
    typeof summary.averageMood === 'number'
      ? MOOD_LABEL_MAP[Math.round(summary.averageMood)] || 'ふつう'
      : null;

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {summary.title}
        </h4>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {summary.entryCount}件
        </span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-300">
        {roundedMood ? (
          <span>
            平均気分 {roundedMood}{' '}
            <span className="text-primary-500 dark:text-primary-300">
              ({moodLabel})
            </span>
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            気分記録がありません
          </span>
        )}
      </div>

      {SUMMARY_SECTIONS.map((key) => (
        <SummaryList
          key={key}
          title={SECTION_LABEL[key]}
          items={key === 'topTags' ? summary.topTags : summary.topWeather}
        />
      ))}
    </section>
  );
}

function SummaryList({
  title,
  items,
}: {
  title: string;
  items: SummaryItem[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={`${title}-${item.label}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          >
            {item.label}
            <span className="text-gray-500 dark:text-gray-400">
              ×{item.count}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
