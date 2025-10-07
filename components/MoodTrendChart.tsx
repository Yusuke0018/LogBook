'use client';

import { MOOD_LABEL_MAP } from '@/lib/constants/entry';

export interface MoodTrendPoint {
  dateLabel: string;
  averageMood: number | null;
}

const MAX_MOOD = 5;

export default function MoodTrendChart({ data }: { data: MoodTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="h-40 flex items-end gap-3">
      {data.map((point) => {
        const moodValue = point.averageMood;
        const heightPercent =
          typeof moodValue === 'number'
            ? Math.max(12, (moodValue / MAX_MOOD) * 100)
            : 8;

        const labelMood =
          typeof moodValue === 'number'
            ? MOOD_LABEL_MAP[Math.round(moodValue)] || 'ふつう'
            : '未設定';

        return (
          <div
            key={point.dateLabel}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-end">
              <div
                className={`w-full rounded-t-xl transition-all ${
                  typeof moodValue === 'number'
                    ? 'bg-gradient-to-t from-primary-500 to-secondary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                style={{ height: `${heightPercent}%` }}
                title={
                  typeof moodValue === 'number'
                    ? `平均 ${moodValue.toFixed(1)} (${labelMood})`
                    : '記録なし'
                }
              ></div>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{point.dateLabel}</span>
              {typeof moodValue === 'number' && (
                <span className="text-[11px] text-primary-600 dark:text-primary-300">
                  {moodValue.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
