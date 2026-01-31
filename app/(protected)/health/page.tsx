'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  createHealthLog,
  updateHealthLog,
  deleteHealthLog,
  getHealthLogsByUser,
  getHealthLogByDate,
} from '@/lib/services/healthLogs';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import HealthLogForm from '@/components/HealthLogForm';
import HealthLogList from '@/components/HealthLogList';
import { HealthLogChartPanel } from '@/components/HealthLogChart';
import Toast from '@/components/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import { healthLogsToCSV, downloadCSV } from '@/lib/utils/export';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import type { HealthLog, HealthLogFormData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function HealthPage() {
  const { user } = useAuth();
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);
  const [todayLog, setTodayLog] = useState<HealthLog | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (user) {
      loadHealthLogs();
      checkTodayLog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadHealthLogs = async () => {
    if (!user) return;
    try {
      const data = await getHealthLogsByUser(user.uid);
      setHealthLogs(data);
    } catch (error) {
      console.error('健康ログ読み込みエラー:', error);
      showToast('健康ログの読み込みに失敗しました', 'error');
    }
  };

  const checkTodayLog = async () => {
    if (!user) return;
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const log = await getHealthLogByDate(user.uid, today);
      setTodayLog(log);
    } catch (error) {
      console.error('今日のログ確認エラー:', error);
    }
  };

  const handleCreateOrUpdate = async (data: HealthLogFormData) => {
    if (!user) return;

    try {
      // 同じ日付のログが既にあるかチェック
      const existingLog = await getHealthLogByDate(user.uid, data.date);

      if (existingLog && !editingLog) {
        // 既存ログがあり、新規作成の場合は更新するか確認
        if (confirm(`${format(new Date(data.date), 'MM月dd日', { locale: ja })}の記録が既に存在します。上書きしますか？`)) {
          await updateHealthLog(existingLog.id, data);
          showToast('健康ログを更新しました');
        }
      } else if (editingLog) {
        // 編集モードの場合
        await updateHealthLog(editingLog.id, data);
        setEditingLog(null);
        showToast('健康ログを更新しました');
      } else {
        // 新規作成
        await createHealthLog(user.uid, data);
        showToast('健康ログを記録しました');
      }

      await loadHealthLogs();
      await checkTodayLog();
    } catch (error) {
      console.error('健康ログ保存エラー:', error);
      showToast('健康ログの保存に失敗しました', 'error');
    }
  };

  const handleEdit = (log: HealthLog) => {
    setEditingLog(log);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('この記録を削除しますか？')) return;

    try {
      await deleteHealthLog(logId);
      await loadHealthLogs();
      await checkTodayLog();
      if (editingLog?.id === logId) {
        setEditingLog(null);
      }
      showToast('健康ログを削除しました');
    } catch (error) {
      console.error('健康ログ削除エラー:', error);
      showToast('健康ログの削除に失敗しました', 'error');
    }
  };

  const handleExportCSV = () => {
    const csv = healthLogsToCSV(healthLogs);
    const filename = `health_logs_${format(new Date(), 'yyyyMMdd')}.csv`;
    downloadCSV(csv, filename);
    showToast('CSVをダウンロードしました');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // 最新30日分のデータをチャート用に取得
  const chartData = useMemo(() => {
    return healthLogs.slice(0, 30).reverse();
  }, [healthLogs]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="transparent-header sticky top-[52px] z-10">
        <div className="container mx-auto px-3 sm:px-6 py-3">
          <div className="flex justify-between items-center gap-2">
            <div className="header-item flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-soft">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-2xl font-display font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                健康ログ
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleExportCSV}
                disabled={healthLogs.length === 0}
                className="header-btn inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all !px-2 sm:!px-4 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">CSV出力</span>
              </button>
              <div className="header-btn !px-2 sm:!px-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 今日の記録状態 */}
            {todayLog && !editingLog && (
              <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      今日の健康ログは記録済みです
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      睡眠 {Math.floor(todayLog.sleepDuration / 60)}h{todayLog.sleepDuration % 60}m / HRV {todayLog.hrv}ms / 心拍 {todayLog.minHeartRate}bpm / {todayLog.steps.toLocaleString()}歩
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {editingLog ? '健康ログを編集' : '今日の健康を記録'}
                </h2>
              </div>
              <HealthLogForm
                onSubmit={handleCreateOrUpdate}
                existingLog={editingLog}
                onCancel={editingLog ? handleCancelEdit : undefined}
              />
            </div>

            {/* Chart Card */}
            {chartData.length > 0 && (
              <div className="card p-8 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                      トレンド
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      過去{chartData.length}日間の推移
                    </p>
                  </div>
                </div>
                <HealthLogChartPanel data={chartData} />
              </div>
            )}
          </div>

          {/* Sidebar - History */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  記録履歴
                </h3>
                <HealthLogList
                  logs={healthLogs.slice(0, 10)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {healthLogs.length > 10 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    他 {healthLogs.length - 10}件の記録
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}
