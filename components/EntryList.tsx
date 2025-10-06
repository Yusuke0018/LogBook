'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Entry } from '@/lib/types';

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
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
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(entry)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="編集"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
