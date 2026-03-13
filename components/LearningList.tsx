'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { Learning } from '@/lib/types';

interface LearningListProps {
  learnings: Learning[];
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export default function LearningList({ learnings, onDelete, onTagClick }: LearningListProps) {
  if (learnings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">まだ学びがありません</p>
        <p className="text-sm mt-1">学んだことを貼り付けてみましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {learnings.map((learning) => (
        <div
          key={learning.id}
          className="p-5 bg-white/60 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl group"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                {learning.content}
              </p>
              {learning.source && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                  出典: {learning.source}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {format(learning.createdAt.toDate(), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </span>
                {learning.tags?.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('削除しますか？')) onDelete(learning.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
