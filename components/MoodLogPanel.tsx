'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  FaceSmileIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  createMoodLog,
  deleteMoodLog,
  getMoodLogsByUser,
} from '@/lib/services/moodLogs';
import { moodLogsToCSV, downloadCSV } from '@/lib/utils/export';
import MoodLogForm from './MoodLogForm';
import MoodLogList from './MoodLogList';
import MoodLogChart from './MoodLogChart';
import type { MoodLog, MoodLogFormData } from '@/lib/types';

interface MoodLogPanelProps {
  userId?: string;
}

export default function MoodLogPanel({ userId }: MoodLogPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  useEffect(() => {
    if (userId && isOpen) {
      loadMoodLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOpen]);

  const loadMoodLogs = async () => {
    if (!userId) return;
    try {
      const logs = await getMoodLogsByUser(userId);
      setMoodLogs(logs);
    } catch (error) {
      console.error('気分ログ読み込みエラー:', error);
    }
  };

  const handleSubmit = async (data: MoodLogFormData) => {
    if (!userId) return;
    try {
      await createMoodLog(userId, data);
      await loadMoodLogs();
    } catch (error) {
      console.error('気分ログ作成エラー:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMoodLog(id);
      await loadMoodLogs();
    } catch (error) {
      console.error('気分ログ削除エラー:', error);
    }
  };

  const handleExportCSV = () => {
    const csv = moodLogsToCSV(moodLogs);
    const filename = `mood_logs_${format(new Date(), 'yyyyMMdd')}.csv`;
    downloadCSV(csv, filename);
  };

  // 今日の記録数
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return moodLogs.filter((log) => {
      const logDate = log.createdAt.toDate();
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    }).length;
  }, [moodLogs]);

  // 今日の平均スコア
  const todayAverage = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = moodLogs.filter((log) => {
      const logDate = log.createdAt.toDate();
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    if (todayLogs.length === 0) return null;
    const sum = todayLogs.reduce((acc, log) => acc + log.score, 0);
    return (sum / todayLogs.length).toFixed(1);
  }, [moodLogs]);

  if (!userId) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-40 p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        title="気分を記録"
      >
        <FaceSmileIcon className="h-6 w-6" />
        {todayCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-purple-600">
            {todayCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-24 z-50 w-80 sm:w-96 max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                <FaceSmileIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  気分トラッカー
                </h3>
                {todayAverage !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    今日の平均: {todayAverage} ({todayCount}件)
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportCSV}
                disabled={moodLogs.length === 0}
                className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
                title="CSVエクスポート"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Form */}
            <MoodLogForm onSubmit={handleSubmit} />

            {/* Toggle buttons */}
            <div className="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => setShowChart(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  !showChart
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                履歴
              </button>
              <button
                onClick={() => setShowChart(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  showChart
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                グラフ
              </button>
            </div>

            {/* Chart or List */}
            {showChart ? (
              <div className="space-y-3">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setTrendDays(7)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      trendDays === 7
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    7日
                  </button>
                  <button
                    onClick={() => setTrendDays(30)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      trendDays === 30
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    30日
                  </button>
                </div>
                <MoodLogChart data={moodLogs} days={trendDays} />
              </div>
            ) : (
              <MoodLogList logs={moodLogs.slice(0, 10)} onDelete={handleDelete} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
