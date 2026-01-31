'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Entry, Memo } from '@/lib/types';

export type UnifiedItem =
  | { type: 'entry'; data: Entry }
  | { type: 'memo'; data: Memo };

interface UnifiedListProps {
  items: UnifiedItem[];
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onDeleteMemo?: (memoId: string) => void;
  highlightedEntryId?: string | null;
}

export default function UnifiedList({
  items,
  onEditEntry,
  onDeleteEntry,
  onDeleteMemo,
  highlightedEntryId,
}: UnifiedListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        まだ投稿がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        if (item.type === 'entry') {
          return (
            <EntryCard
              key={`entry-${item.data.id}`}
              entry={item.data}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              isHighlighted={highlightedEntryId === item.data.id}
            />
          );
        } else {
          return (
            <MemoCard
              key={`memo-${item.data.id}`}
              memo={item.data}
              onDelete={onDeleteMemo}
            />
          );
        }
      })}
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
  isHighlighted,
}: {
  entry: Entry;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entryId: string) => void;
  isHighlighted?: boolean;
}) {
  return (
    <div
      id={`entry-${entry.id}`}
      className={`card p-6 transition-all ${
        isHighlighted
          ? 'ring-2 ring-primary-500 shadow-soft-lg animate-pulse'
          : 'hover:shadow-soft-lg'
      }`}
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

      {entry.imageUrl && (
        <div className="mb-3">
          <img
            src={entry.imageUrl}
            alt="投稿画像"
            className="max-w-full max-h-80 object-contain rounded-xl border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
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
    </div>
  );
}

function MemoCard({
  memo,
  onDelete,
}: {
  memo: Memo;
  onDelete?: (memoId: string) => void;
}) {
  return (
    <div className="group relative p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl hover:shadow-soft transition-all">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg shrink-0">
          <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              日々の断片
            </p>
            {memo.mood !== undefined && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded" title={`気分: ${memo.mood}`}>
                {memo.mood}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {format(memo.createdAt.toDate(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
          </p>
          {memo.imageUrl && (
            <img
              src={memo.imageUrl}
              alt=""
              className="w-full max-h-48 object-cover rounded-lg mb-3"
            />
          )}
          {memo.content && (
            <p className="text-sm text-gray-700 dark:text-gray-200 break-words">
              {memo.content}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(memo.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all bg-white/80 dark:bg-gray-800/80 rounded-full shrink-0"
            title="削除"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
