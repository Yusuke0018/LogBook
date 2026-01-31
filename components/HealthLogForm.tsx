'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { HealthLog, HealthLogFormData } from '@/lib/types';

interface HealthLogFormProps {
  onSubmit: (data: HealthLogFormData) => Promise<void>;
  existingLog?: HealthLog | null;
  onCancel?: () => void;
}

export default function HealthLogForm({
  onSubmit,
  existingLog,
  onCancel,
}: HealthLogFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(existingLog?.date || today);
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [hrv, setHrv] = useState(existingLog?.hrv || 0);
  const [minHeartRate, setMinHeartRate] = useState(existingLog?.minHeartRate || 0);
  const [steps, setSteps] = useState(existingLog?.steps || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date);
      setSleepHours(Math.floor(existingLog.sleepDuration / 60));
      setSleepMinutes(existingLog.sleepDuration % 60);
      setHrv(existingLog.hrv);
      setMinHeartRate(existingLog.minHeartRate);
      setSteps(existingLog.steps);
    }
  }, [existingLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sleepDuration = sleepHours * 60 + sleepMinutes;
      await onSubmit({
        date,
        sleepDuration,
        hrv,
        minHeartRate,
        steps,
      });

      if (!existingLog) {
        // フォームをリセット
        setSleepHours(0);
        setSleepMinutes(0);
        setHrv(0);
        setMinHeartRate(0);
        setSteps(0);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 日付 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          日付
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={today}
          className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>

      {/* 睡眠時間 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          睡眠時間
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            max="24"
            className="w-20 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-center"
          />
          <span className="text-gray-600 dark:text-gray-400">時間</span>
          <input
            type="number"
            value={sleepMinutes}
            onChange={(e) => setSleepMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            min="0"
            max="59"
            className="w-20 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-center"
          />
          <span className="text-gray-600 dark:text-gray-400">分</span>
        </div>
      </div>

      {/* HRV */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          HRV（心拍変動）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={hrv}
            onChange={(e) => setHrv(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            className="w-32 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-600 dark:text-gray-400">ms</span>
        </div>
      </div>

      {/* 睡眠時最低心拍数 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          睡眠時最低心拍数
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minHeartRate}
            onChange={(e) => setMinHeartRate(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            className="w-32 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-600 dark:text-gray-400">bpm</span>
        </div>
      </div>

      {/* 歩数 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          歩数
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            className="w-32 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-600 dark:text-gray-400">歩</span>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? '保存中...' : existingLog ? '更新' : '記録'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
