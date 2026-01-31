'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { MoodLog } from '@/lib/types';

interface MoodLogListProps {
  logs: MoodLog[];
  onDelete: (id: string) => Promise<void>;
}

const MOOD_COLORS: { [key: number]: string } = {
  0: 'bg-red-600',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-orange-400',
  4: 'bg-yellow-500',
  5: 'bg-yellow-400',
  6: 'bg-lime-400',
  7: 'bg-lime-500',
  8: 'bg-green-400',
  9: 'bg-green-500',
  10: 'bg-emerald-500',
};

export default function MoodLogList({ logs, onDelete }: MoodLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        気分の記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl"
        >
          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-white font-bold rounded-full ${MOOD_COLORS[log.score]}`}>
            {log.score}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {format(log.createdAt.toDate(), 'MM/dd HH:mm', { locale: ja })}
            </div>
            {log.note && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {log.note}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(log.id)}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="削除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
