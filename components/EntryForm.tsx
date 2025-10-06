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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          タイトル（任意）
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="タイトルを入力"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          本文 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="今日の出来事を記録..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            タグ（カンマ区切り）
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="仕事, プライベート"
          />
        </div>

        <div>
          <label
            htmlFor="weather"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            天気
          </label>
          <input
            type="text"
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="晴れ, 曇り, 雨"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5 mr-2" />
          {isSubmitting ? '送信中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
