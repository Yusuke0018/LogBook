'use client';

import { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import type { EntryFormData } from '@/lib/types';
import {
  CONDITION_OPTIONS,
  MOOD_SCALE,
} from '@/lib/constants/entry';

interface EntryFormProps {
  onSubmit: (data: EntryFormData) => Promise<void>;
  initialData?: Partial<EntryFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function EntryForm({
  onSubmit,
  initialData,
  submitLabel = '投稿',
  onCancel,
}: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [weather, setWeather] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // initialDataが変更されたときにフォームを更新
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags((initialData.tags || []).join(', '));
      setWeather(initialData.weather || '');
      setMood(
        typeof initialData.mood === 'number' ? initialData.mood : null
      );
      setConditions(initialData.conditions || []);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setWeather('');
      setMood(null);
      setConditions([]);
    }
  }, [initialData]);

  const handleMoodSelect = (value: number) => {
    setMood((prev) => (prev === value ? null : value));
  };

  const toggleCondition = (value: string) => {
    setConditions((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

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
        mood,
        conditions,
      };

      await onSubmit(data);

      // 編集モードでない場合のみフォームをリセット
      if (!initialData) {
        setTitle('');
        setContent('');
        setTags('');
        setWeather('');
        setMood(null);
        setConditions([]);
      }
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            気分スコア<span className="text-gray-400 font-normal ml-1">(1-5)</span>
          </label>
          {mood !== null && (
            <button
              type="button"
              onClick={() => setMood(null)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              クリア
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MOOD_SCALE.map((option) => {
            const isActive = mood === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-200'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {option.emoji}
                </span>
                <span className="text-sm font-medium">{option.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          体調メモ
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONDITION_OPTIONS.map((option) => {
            const checked = conditions.includes(option);
            return (
              <label
                key={option}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:border-secondary-400 dark:text-secondary-200'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-secondary-300 dark:hover:border-secondary-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCondition(option)}
                  className="hidden"
                />
                <span className="text-sm">{option}</span>
              </label>
            );
          })}
        </div>
      </div>

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
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-button shadow-card hover:shadow-soft-lg transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          {isSubmitting ? '送信中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
