'use client';

import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import type { FutureLetterFormData, LetterPeriod } from '@/lib/types';

interface FutureLetterFormProps {
  onSubmit: (data: FutureLetterFormData) => Promise<void>;
  onCancel?: () => void;
}

const PERIOD_OPTIONS: { value: LetterPeriod; label: string; description: string; emoji: string }[] = [
  { value: 'short', label: '短期', description: '1ヶ月後〜半年後', emoji: '🌱' },
  { value: 'medium', label: '中期', description: '半年後〜1年後', emoji: '🌿' },
  { value: 'long', label: '長期', description: '1年後〜2年後', emoji: '🌳' },
];

export default function FutureLetterForm({ onSubmit, onCancel }: FutureLetterFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [period, setPeriod] = useState<LetterPeriod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !period || !title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        period,
      });

      // フォームをリセット
      setTitle('');
      setContent('');
      setPeriod(null);
    } catch (error) {
      console.error('送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 期間選択 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          いつ届く？ <span className="text-accent-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                period === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
            >
              <div className="text-2xl mb-2">{option.emoji}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {option.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <label
          htmlFor="letter-title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          件名 <span className="text-accent-500">*</span>
        </label>
        <input
          type="text"
          id="letter-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
          placeholder="未来の自分へ..."
        />
      </div>

      {/* 本文 */}
      <div className="space-y-2">
        <label
          htmlFor="letter-content"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          手紙の内容 <span className="text-accent-500">*</span>
        </label>
        <textarea
          id="letter-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400 resize-none"
          placeholder="今の気持ち、未来への期待、大切にしたいこと..."
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-button hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !period || !title.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-button shadow-card hover:shadow-soft-lg transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          {isSubmitting ? '送信中...' : '未来へ送る'}
        </button>
      </div>
    </form>
  );
}
