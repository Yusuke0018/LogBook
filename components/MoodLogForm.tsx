'use client';

import { useState } from 'react';
import type { MoodLogFormData } from '@/lib/types';

interface MoodLogFormProps {
  onSubmit: (data: MoodLogFormData) => Promise<void>;
}

const MOOD_LABELS: { [key: number]: string } = {
  0: '最悪',
  1: 'とても悪い',
  2: '悪い',
  3: 'やや悪い',
  4: '少し悪い',
  5: 'ふつう',
  6: '少し良い',
  7: 'やや良い',
  8: '良い',
  9: 'とても良い',
  10: '最高',
};

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

export default function MoodLogForm({ onSubmit }: MoodLogFormProps) {
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ score, note: note.trim() || undefined });
      setNote('');
      setScore(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* スコア選択 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            今の気分
          </label>
          <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${MOOD_COLORS[score]}`}>
            {score} - {MOOD_LABELS[score]}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* メモ（任意） */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          メモ（任意）
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今の気持ちを一言..."
          rows={2}
          maxLength={200}
          className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
        />
      </div>

      {/* 記録ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? '記録中...' : '気分を記録'}
      </button>
    </form>
  );
}
