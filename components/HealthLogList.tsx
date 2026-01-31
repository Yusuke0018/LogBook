'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { HealthLog } from '@/lib/types';

interface HealthLogListProps {
  logs: HealthLog[];
  onEdit: (log: HealthLog) => void;
  onDelete: (id: string) => Promise<void>;
}

function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
}

export default function HealthLogList({ logs, onEdit, onDelete }: HealthLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        健康ログがありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(new Date(log.date), 'MM月dd日 (EEE)', { locale: ja })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(log)}
                className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                title="編集"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(log.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="削除"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">睡眠:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatSleepDuration(log.sleepDuration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">HRV:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {log.hrv}ms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">最低心拍:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {log.minHeartRate}bpm
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">歩数:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {log.steps.toLocaleString()}歩
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
