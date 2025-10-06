'use client';

import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import type { EntryFormData } from '@/lib/types';

interface EntryFormProps {
  onSubmit: (data: EntryFormData) => Promise<void>;
  initialData?: Partial<EntryFormData>;
  submitLabel?: string;
}

export default function EntryForm({
  onSubmit,
  initialData,
  submitLabel = '投稿',
}: EntryFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState((initialData?.tags || []).join(', '));
  const [weather, setWeather] = useState(initialData?.weather || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const data: EntryFormData = {
        title: title.trim() || undefined,
        content: content.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        weather: weather.trim() || undefined,
      };

      await onSubmit(data);

      // フォームをリセット
      setTitle('');
      setContent('');
      setTags('');
      setWeather('');
    } catch (error) {
      console.error('投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          タイトル<span className="text-gray-400 font-normal ml-1">(任意)</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
          placeholder="タイトルを入力"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          本文 <span className="text-accent-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400 resize-none"
          placeholder="今日の出来事を記録..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="tags"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            タグ
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
            placeholder="仕事, プライベート"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="weather"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            天気
          </label>
          <input
            type="text"
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
            placeholder="☀️ 晴れ / ☁️ 曇り / 🌧️ 雨"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white gradient-primary rounded-xl shadow-soft hover:shadow-soft-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          {isSubmitting ? '送信中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
