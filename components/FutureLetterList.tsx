'use client';

import { useState } from 'react';
import { EnvelopeIcon, EnvelopeOpenIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/solid';
import type { FutureLetter } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface FutureLetterListProps {
  deliveredLetters: FutureLetter[];
  pendingLetters: FutureLetter[];
  onOpen: (letterId: string) => Promise<void>;
  onDelete: (letterId: string) => Promise<void>;
}

const PERIOD_LABELS: Record<string, { label: string; emoji: string }> = {
  short: { label: '短期', emoji: '🌱' },
  medium: { label: '中期', emoji: '🌿' },
  long: { label: '長期', emoji: '🌳' },
};

function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function LetterCard({
  letter,
  isDelivered,
  onOpen,
  onDelete,
}: {
  letter: FutureLetter;
  isDelivered: boolean;
  onOpen: (letterId: string) => Promise<void>;
  onDelete: (letterId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const periodInfo = PERIOD_LABELS[letter.period] || { label: '不明', emoji: '❓' };

  const handleOpen = async () => {
    if (!letter.isOpened) {
      await onOpen(letter.id);
    }
    setIsExpanded(true);
  };

  const handleDelete = async () => {
    if (confirm('この手紙を削除しますか？')) {
      setIsDeleting(true);
      try {
        await onDelete(letter.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // 未配達の手紙
  if (!isDelivered) {
    return (
      <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <ClockIcon className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            配達待ち
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{periodInfo.emoji}</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{periodInfo.label}</span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 italic">
          届くまでお楽しみ...
        </p>
      </div>
    );
  }

  // 配達済みだが未開封
  if (!letter.isOpened && !isExpanded) {
    return (
      <button
        onClick={handleOpen}
        className="w-full p-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl border-2 border-primary-300 dark:border-primary-600 hover:shadow-lg transition-all text-left group"
      >
        <div className="flex items-center justify-center mb-4">
          <EnvelopeIcon className="h-12 w-12 text-primary-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-200">未来からの手紙が届いています！</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(letter.deliveryDate)} に届きました
          </p>
          <p className="text-xs text-primary-500 mt-3">クリックして開封</p>
        </div>
      </button>
    );
  }

  // 開封済み
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(letter.createdAt)} に書きました
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{periodInfo.emoji}</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
        {letter.title}
      </h3>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {letter.content}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400">
          {formatDate(letter.deliveryDate)} に届きました
          {letter.openedAt && ` ・ ${formatDate(letter.openedAt)} に開封`}
        </p>
      </div>
    </div>
  );
}

export default function FutureLetterList({
  deliveredLetters,
  pendingLetters,
  onOpen,
  onDelete,
}: FutureLetterListProps) {
  const unopenedCount = deliveredLetters.filter(l => !l.isOpened).length;

  return (
    <div className="space-y-8">
      {/* 届いた手紙 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            届いた手紙
          </h2>
          {unopenedCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unopenedCount}
            </span>
          )}
        </div>

        {deliveredLetters.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>まだ届いた手紙はありません</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {deliveredLetters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                isDelivered={true}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* 待機中の手紙 */}
      {pendingLetters.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              配達待ち ({pendingLetters.length}通)
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingLetters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                isDelivered={false}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
