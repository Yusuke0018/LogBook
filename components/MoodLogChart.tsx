'use client';

import { useId, useMemo } from 'react';
import { format, startOfDay, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { MoodLog } from '@/lib/types';

interface MoodLogChartProps {
  data: MoodLog[];
  days?: number;
}

const WIDTH = 100;
const HEIGHT = 60;
const PADDING = { top: 10, right: 8, bottom: 14, left: 10 };
const MIN_MOOD = 0;
const MAX_MOOD = 10;

interface DailyMoodPoint {
  date: Date;
  dateLabel: string;
  averageMood: number | null;
  count: number;
}

export default function MoodLogChart({ data, days = 7 }: MoodLogChartProps) {
  const gradientId = useId();

  const chart = useMemo(() => {
    const today = startOfDay(new Date());
    const dailyData: DailyMoodPoint[] = [];

    // 過去N日分のデータを準備
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = data.filter((log) => {
        const logDate = log.createdAt.toDate();
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const scores = dayLogs.map((log) => log.score);
      const averageMood = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;

      dailyData.push({
        date,
        dateLabel: format(date, days > 7 ? 'MM/dd' : 'MM/dd', { locale: ja }),
        averageMood,
        count: dayLogs.length,
      });
    }

    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;

    const mapX = (index: number) => {
      if (dailyData.length <= 1) {
        return PADDING.left + plotWidth / 2;
      }
      const ratio = index / (dailyData.length - 1);
      return PADDING.left + ratio * plotWidth;
    };

    const mapY = (mood: number) => {
      const clamped = Math.min(MAX_MOOD, Math.max(MIN_MOOD, mood));
      const ratio = (clamped - MIN_MOOD) / (MAX_MOOD - MIN_MOOD);
      return PADDING.top + (1 - ratio) * plotHeight;
    };

    const points = dailyData.map((point, index) => ({
      ...point,
      x: mapX(index),
      y: point.averageMood !== null ? mapY(point.averageMood) : null,
    }));

    const validPoints = points.filter(
      (p): p is typeof p & { y: number; averageMood: number } =>
        p.y !== null && p.averageMood !== null
    );

    const toFixed = (value: number) => Number(value.toFixed(2));
    const baselineY = HEIGHT - PADDING.bottom;

    let linePath = '';
    validPoints.forEach((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      linePath += `${command}${toFixed(point.x)} ${toFixed(point.y)} `;
    });
    linePath = linePath.trim();

    let areaPath = '';
    if (validPoints.length > 0) {
      areaPath = `M${toFixed(validPoints[0].x)} ${toFixed(baselineY)} `;
      validPoints.forEach((point) => {
        areaPath += `L${toFixed(point.x)} ${toFixed(point.y)} `;
      });
      areaPath += `L${toFixed(validPoints[validPoints.length - 1].x)} ${toFixed(baselineY)} Z`;
    }

    const labelStep = dailyData.length > 8 ? Math.ceil(dailyData.length / 6) : dailyData.length > 4 ? 2 : 1;
    const axisLabels = points.filter(
      (_, index) => index % labelStep === 0 || index === dailyData.length - 1
    );

    // グリッドライン（0, 5, 10）
    const gridLines = [0, 5, 10].map((value) => ({
      value,
      y: mapY(value),
    }));

    return {
      points,
      validPoints,
      linePath,
      areaPath,
      baselineY,
      axisLabels,
      gridLines,
    };
  }, [data, days]);

  if (chart.validPoints.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white/40 dark:bg-gray-800/40">
        気分の記録がありません
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        role="img"
        aria-label="気分推移の折れ線グラフ"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-48 sm:h-56"
      >
        <title>気分推移</title>
        <defs>
          <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </linearGradient>
        </defs>

        {/* 背景 */}
        <rect
          x="0"
          y="0"
          width={WIDTH}
          height={HEIGHT}
          rx="6"
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
              strokeWidth={0.2}
              strokeDasharray="3 2"
            />
            <text
              x={PADDING.left - 2}
              y={line.y + 1}
              textAnchor="end"
              className="fill-gray-400 dark:fill-gray-500 text-[2.8px]"
            >
              {line.value}
            </text>
          </g>
        ))}

        {/* エリア */}
        {chart.areaPath && (
          <path d={chart.areaPath} fill={`url(#${gradientId}-area)`} opacity={0.7} />
        )}

        {/* ライン */}
        {chart.linePath && (
          <path
            d={chart.linePath}
            fill="none"
            stroke={`url(#${gradientId}-line)`}
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* データポイント */}
        {chart.validPoints.map((point) => (
          <g key={`point-${point.dateLabel}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={1.6}
              className="fill-white dark:fill-gray-900 stroke-purple-500 dark:stroke-purple-300"
              strokeWidth={0.7}
            >
              <title>
                {`${point.dateLabel}: 平均 ${point.averageMood.toFixed(1)} (${point.count}件)`}
              </title>
            </circle>
            <circle
              cx={point.x}
              cy={point.y}
              r={0.8}
              className="fill-purple-500 dark:fill-purple-300"
            />
          </g>
        ))}

        {/* X軸ラベル */}
        {chart.axisLabels.map((point) => (
          <g key={`label-${point.dateLabel}`} transform={`translate(${point.x}, ${chart.baselineY})`}>
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={2.5}
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth={0.3}
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400 text-[2.8px]"
            >
              {point.dateLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
