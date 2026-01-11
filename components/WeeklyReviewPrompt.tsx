'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ChartBarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { WeeklyReview, WeeklyReviewFormData } from '@/lib/types';
import {
  createWeeklyReview,
  updateWeeklyReview,
  getCurrentWeekReview,
  getWeekStartDate,
  isSunday,
} from '@/lib/services/weeklyReviews';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface WeeklyReviewPromptProps {
  userId: string;
  onComplete?: () => void;
}

export default function WeeklyReviewPrompt({ userId, onComplete }: WeeklyReviewPromptProps) {
  const [isVisible, setIsVisible] = useState(true); // デフォルトで表示
  const [existingReview, setExistingReview] = useState<WeeklyReview | null>(null);
  const [stabilityScore, setStabilityScore] = useState(5);
  const [stimulationScore, setStimulationScore] = useState(5);
  const [nextWeekTask, setNextWeekTask] = useState('');
  const [freeMemo, setFreeMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkReviewStatus();
    }
  }, [userId]);

  const checkReviewStatus = async () => {
    setIsLoading(true);
    try {
      const review = await getCurrentWeekReview(userId);
      if (review) {
        setExistingReview(review);
        setStabilityScore(review.stabilityScore);
        setStimulationScore(review.stimulationScore);
        setNextWeekTask(review.nextWeekTask);
        setFreeMemo(review.freeMemo || '');
        setIsCompleted(true);
        // 書いた後は日曜日のみコンパクト表示、それ以外は非表示
        setIsVisible(isSunday());
      } else {
        // 書いていない場合は常に表示
        setIsVisible(true);
      }
    } catch (error) {
      console.error('振り返りステータスの確認に失敗:', error);
      // エラー時も表示（初回利用時はコレクションがないため）
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextWeekTask.trim()) return;

    setIsSubmitting(true);
    try {
      const data: WeeklyReviewFormData = {
        stabilityScore,
        stimulationScore,
        nextWeekTask: nextWeekTask.trim(),
        freeMemo: freeMemo.trim() || undefined,
      };

      if (existingReview) {
        await updateWeeklyReview(existingReview.id, data);
      } else {
        await createWeeklyReview(userId, data);
      }

      setIsCompleted(true);
      setIsEditing(false);
      onComplete?.();
    } catch (error) {
      console.error('振り返りの保存に失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekStart = getWeekStartDate();
  const weekLabel = format(weekStart, 'M月d日', { locale: ja });

  // ローディング中またはエラー時もフォームを表示
  if (!isVisible && !isLoading) return null;

  // 完了済み & 編集モードでない場合は簡潔な表示
  if (isCompleted && !isEditing) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                今週の振り返り完了
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                安定: {stabilityScore} / 刺激: {stimulationScore}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/weekly-review"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-700/50 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              履歴
            </Link>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-700/50 transition-colors"
            >
              編集
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-rose-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              週次振り返り
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {weekLabel}の週
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ① 今週の点数 */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            ① 今週の点数（0〜10）
          </label>

          {/* 安定スコア */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="text-lg">🌿</span> 安定
              </span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 min-w-[2.5rem] text-right">
                {stabilityScore}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={stabilityScore}
              onChange={(e) => setStabilityScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>不安定</span>
              <span>安定</span>
            </div>
          </div>

          {/* 刺激スコア */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="text-lg">⚡</span> 刺激
              </span>
              <span className="text-lg font-bold text-secondary-600 dark:text-secondary-400 min-w-[2.5rem] text-right">
                {stimulationScore}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={stimulationScore}
              onChange={(e) => setStimulationScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>退屈</span>
              <span>刺激的</span>
            </div>
          </div>
        </div>

        {/* ② 来週やること */}
        <div className="space-y-2">
          <label
            htmlFor="next-week-task"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            ② 来週やること（1つだけ）<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="next-week-task"
            value={nextWeekTask}
            onChange={(e) => setNextWeekTask(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400"
            placeholder="例：毎日10分の読書をする"
          />
        </div>

        {/* ③ 自由メモ */}
        <div className="space-y-2">
          <label
            htmlFor="free-memo"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            ③ 自由メモ（任意）
          </label>
          <textarea
            id="free-memo"
            value={freeMemo}
            onChange={(e) => setFreeMemo(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all placeholder:text-gray-400 resize-none"
            placeholder="今週の気づき、来週への意気込みなど..."
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/weekly-review"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            過去の振り返り
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !nextWeekTask.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <CheckCircleIcon className="w-5 h-5" />
            {isSubmitting ? '保存中...' : existingReview ? '更新する' : '記録する'}
          </button>
        </div>
      </form>
    </div>
  );
}
