'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Entry } from '@/lib/types';
import { MOOD_EMOJI_MAP, MOOD_LABEL_MAP } from '@/lib/constants/entry';

interface EntryListProps {
  entries: Entry[];
  onEdit?: (entry: Entry) => void;
  onDelete?: (entryId: string) => void;
}

export default function EntryList({
  entries,
  onEdit,
  onDelete,
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        まだ投稿がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="card p-6 hover:shadow-soft-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              {entry.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {entry.title}
                </h3>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(entry.createdAt.toDate(), 'yyyy年MM月dd日 HH:mm', {
                  locale: ja,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(entry)}
                  className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="編集"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="削除"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
            {entry.content}
          </p>

          <div className="flex flex-wrap gap-2 items-center">
            {typeof entry.mood === 'number' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-200">
                <span className="text-base mr-1" aria-hidden>
                  {MOOD_EMOJI_MAP[entry.mood] || '🙂'}
                </span>
                気分 {entry.mood} ({MOOD_LABEL_MAP[entry.mood] || '未設定'})
              </span>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {entry.weather && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                🌤️ {entry.weather}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
