'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getWeeklyReviewsByUser } from '@/lib/services/weeklyReviews';
import ThemeToggle from '@/components/ThemeToggle';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { WeeklyReview } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

// チャート設定
const WIDTH = 100;
const HEIGHT = 50;
const PADDING = { top: 8, right: 8, bottom: 12, left: 12 };

interface ChartPoint {
  weekLabel: string;
  stability: number;
  stimulation: number;
  x: number;
  yStability: number;
  yStimulation: number;
}

function WeeklyScoreChart({ reviews }: { reviews: WeeklyReview[] }) {
  const gradientId = useId();

  const chart = useMemo(() => {
    // 古い順にソート
    const sortedReviews = [...reviews].reverse();
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;

    const mapX = (index: number) => {
      if (sortedReviews.length <= 1) {
        return PADDING.left + plotWidth / 2;
      }
      const ratio = index / (sortedReviews.length - 1);
      return PADDING.left + ratio * plotWidth;
    };

    const mapY = (score: number) => {
      const ratio = score / 10;
      return PADDING.top + (1 - ratio) * plotHeight;
    };

    const points: ChartPoint[] = sortedReviews.map((review, index) => {
      const weekDate = review.weekStartDate.toDate();
      return {
        weekLabel: format(weekDate, 'M/d', { locale: ja }),
        stability: review.stabilityScore,
        stimulation: review.stimulationScore,
        x: mapX(index),
        yStability: mapY(review.stabilityScore),
        yStimulation: mapY(review.stimulationScore),
      };
    });

    const toFixed = (value: number) => Number(value.toFixed(2));

    // 安定スコアのパス
    let stabilityPath = '';
    points.forEach((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      stabilityPath += `${command}${toFixed(point.x)} ${toFixed(point.yStability)} `;
    });

    // 刺激スコアのパス
    let stimulationPath = '';
    points.forEach((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      stimulationPath += `${command}${toFixed(point.x)} ${toFixed(point.yStimulation)} `;
    });

    // グリッドライン
    const gridLines = [0, 2, 4, 6, 8, 10].map((value) => ({
      value,
      y: mapY(value),
    }));

    // ラベル
    const labelStep = sortedReviews.length > 8 ? Math.ceil(sortedReviews.length / 6) : 1;
    const axisLabels = points.filter(
      (_, index) => index % labelStep === 0 || index === points.length - 1
    );

    return {
      points,
      stabilityPath: stabilityPath.trim(),
      stimulationPath: stimulationPath.trim(),
      gridLines,
      axisLabels,
      baselineY: HEIGHT - PADDING.bottom,
    };
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white/40 dark:bg-gray-800/40">
        まだ振り返りの記録がありません
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* 凡例 */}
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-gray-600 dark:text-gray-400">安定</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600 dark:text-gray-400">刺激</span>
        </div>
      </div>

      <svg
        role="img"
        aria-label="週次スコア推移グラフ"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-48 sm:h-56"
      >
        <title>週次スコア推移</title>
        <defs>
          <linearGradient id={`${gradientId}-stability`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id={`${gradientId}-stimulation`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* 背景 */}
        <rect
          x="0"
          y="0"
          width={WIDTH}
          height={HEIGHT}
          rx="4"
          className="fill-white/70 dark:fill-gray-900/40"
        />

        {/* グリッドライン */}
        {chart.gridLines.map((line) => (
          <g key={`grid-${line.value}`}>
            <line
              x1={PADDING.left}
              y1={line.y}
              x2={WIDTH - PADDING.right}
              y2={line.y}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={0.15}
              strokeDasharray="2 1"
            />
            <text
              x={PADDING.left - 1.5}
              y={line.y + 1}
              textAnchor="end"
              className="fill-gray-400 dark:fill-gray-500 text-[2.5px]"
            >
              {line.value}
            </text>
          </g>
        ))}

        {/* 安定スコアライン */}
        {chart.stabilityPath && (
          <path
            d={chart.stabilityPath}
            fill="none"
            stroke={`url(#${gradientId}-stability)`}
            strokeWidth={1.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* 刺激スコアライン */}
        {chart.stimulationPath && (
          <path
            d={chart.stimulationPath}
            fill="none"
            stroke={`url(#${gradientId}-stimulation)`}
            strokeWidth={1.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* データポイント - 安定 */}
        {chart.points.map((point) => (
          <g key={`stability-${point.weekLabel}`}>
            <circle
              cx={point.x}
              cy={point.yStability}
              r={1.4}
              className="fill-teal-500"
            >
              <title>{`${point.weekLabel}: 安定 ${point.stability}`}</title>
            </circle>
          </g>
        ))}

        {/* データポイント - 刺激 */}
        {chart.points.map((point) => (
          <g key={`stimulation-${point.weekLabel}`}>
            <circle
              cx={point.x}
              cy={point.yStimulation}
              r={1.4}
              className="fill-orange-500"
            >
              <title>{`${point.weekLabel}: 刺激 ${point.stimulation}`}</title>
            </circle>
          </g>
        ))}

        {/* X軸ラベル */}
        {chart.axisLabels.map((point) => (
          <g key={`label-${point.weekLabel}`} transform={`translate(${point.x}, ${chart.baselineY})`}>
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={2}
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth={0.2}
            />
            <text
              x={0}
              y={4.5}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400 text-[2.5px]"
            >
              {point.weekLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ReviewCard({ review }: { review: WeeklyReview }) {
  const weekDate = review.weekStartDate.toDate();
  const weekLabel = format(weekDate, 'M月d日の週', { locale: ja });

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl">
            <CalendarDaysIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{weekLabel}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {format(review.createdAt.toDate(), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">安定</div>
            <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {review.stabilityScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">刺激</div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {review.stimulationScore}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            来週やること
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
            {review.nextWeekTask}
          </p>
        </div>

        {review.freeMemo && (
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              自由メモ
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {review.freeMemo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyReviewPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getWeeklyReviewsByUser(user.uid);
      setReviews(data);
    } catch (error) {
      console.error('振り返りの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 統計計算
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;

    const avgStability = reviews.reduce((sum, r) => sum + r.stabilityScore, 0) / reviews.length;
    const avgStimulation = reviews.reduce((sum, r) => sum + r.stimulationScore, 0) / reviews.length;

    return {
      totalWeeks: reviews.length,
      avgStability: avgStability.toFixed(1),
      avgStimulation: avgStimulation.toFixed(1),
    };
  }, [reviews]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="transparent-header sticky top-[52px] z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="header-item flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-soft">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  週次振り返り
                </h1>
              </div>
            </div>
            <div className="header-btn">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* 統計サマリー */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {stats.totalWeeks}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">週</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {stats.avgStability}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">平均安定</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.avgStimulation}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">平均刺激</div>
                </div>
              </div>
            )}

            {/* チャート */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                スコア推移
              </h2>
              <WeeklyScoreChart reviews={reviews} />
            </div>

            {/* レビュー一覧 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                振り返り履歴
              </h2>
              {reviews.length === 0 ? (
                <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>まだ振り返りの記録がありません</p>
                  <p className="text-sm mt-2">
                    日曜日にダッシュボードで振り返りを記録しましょう
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
