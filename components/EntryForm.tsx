'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/solid';
import type { EntryFormData } from '@/lib/types';
import { MOOD_SCALE } from '@/lib/constants/entry';
import { uploadImage } from '@/lib/services/storage';
import { format } from 'date-fns';

interface EntryFormProps {
  onSubmit: (data: EntryFormData) => Promise<void>;
  initialData?: Partial<EntryFormData>;
  initialCreatedAt?: Date; // 編集時の既存の日付
  submitLabel?: string;
  onCancel?: () => void;
  userId?: string;
}

// 今日の日付をYYYY-MM-DD形式で取得
const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

export default function EntryForm({
  onSubmit,
  initialData,
  initialCreatedAt,
  submitLabel = '投稿',
  onCancel,
  userId,
}: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weather, setWeather] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // initialDataが変更されたときにフォームを更新
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setWeather(initialData.weather || '');
      setMood(
        typeof initialData.mood === 'number' ? initialData.mood : null
      );
      setExistingImageUrl(initialData.imageUrl || null);
      setImageFile(null);
      setImagePreview(null);
      // 編集時は既存の日付を設定
      if (initialCreatedAt) {
        setEntryDate(format(initialCreatedAt, 'yyyy-MM-dd'));
      }
    } else {
      setTitle('');
      setContent('');
      setWeather('');
      setMood(null);
      setEntryDate(getTodayString());
      setExistingImageUrl(null);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [initialData, initialCreatedAt]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setExistingImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMoodSelect = (value: number) => {
    setMood((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = existingImageUrl || undefined;

      // 新しい画像がある場合はアップロード
      if (imageFile && userId) {
        imageUrl = await uploadImage(userId, imageFile);
      }

      const data: EntryFormData = {
        title: title.trim() || undefined,
        content: content.trim(),
        weather: weather.trim() || undefined,
        mood,
        imageUrl,
        entryDate,
      };

      await onSubmit(data);

      // 編集モードでない場合のみフォームをリセット
      if (!initialData) {
        setTitle('');
        setContent('');
        setWeather('');
        setMood(null);
        setEntryDate(getTodayString());
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 日付選択 */}
      <div className="space-y-2">
        <label
          htmlFor="entryDate"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            日付
          </span>
        </label>
        <input
          type="date"
          id="entryDate"
          value={entryDate}
          max={getTodayString()}
          onChange={(e) => setEntryDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          過去の日付のみ選択できます
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          今日のトピック<span className="text-gray-400 font-normal ml-1">(任意)</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
          placeholder="今日のトピックを入力"
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

      {/* 画像アップロード */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          写真<span className="text-gray-400 font-normal ml-1">(任意)</span>
        </label>
        <div className="flex items-start gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <PhotoIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              写真を選択
            </span>
          </label>
          {(imagePreview || existingImageUrl) && (
            <div className="relative">
              <img
                src={imagePreview || existingImageUrl || ''}
                alt="プレビュー"
                className="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
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
