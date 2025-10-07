'use client';

import { useId, useMemo } from 'react';
import { MOOD_LABEL_MAP } from '@/lib/constants/entry';

export interface MoodTrendPoint {
  dateLabel: string;
  averageMood: number | null;
}

const MIN_MOOD = 1;
const MAX_MOOD = 5;
const WIDTH = 100;
const HEIGHT = 60;
const PADDING = { top: 10, right: 8, bottom: 14, left: 10 };
const GRID_VALUES = [1, 2, 3, 4, 5] as const;

interface ChartPoint extends MoodTrendPoint {
  x: number;
  y: number | null;
}

export default function MoodTrendChart({ data }: { data: MoodTrendPoint[] }) {
  const gradientId = useId();

  const chart = useMemo(() => {
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const mapX = (index: number) => {
      if (data.length <= 1) {
        return PADDING.left + plotWidth / 2;
      }
      const ratio = index / (data.length - 1);
      return PADDING.left + ratio * plotWidth;
    };
    const mapMoodToY = (mood: number) => {
      const clamped = Math.min(MAX_MOOD, Math.max(MIN_MOOD, mood));
      const ratio = (clamped - MIN_MOOD) / (MAX_MOOD - MIN_MOOD);
      return PADDING.top + (1 - ratio) * plotHeight;
    };

    const points: ChartPoint[] = data.map((point, index) => {
      const x = mapX(index);
      if (typeof point.averageMood !== 'number' || Number.isNaN(point.averageMood)) {
        return { ...point, x, y: null };
      }
      const y = mapMoodToY(point.averageMood);
      return { ...point, x, y };
    });

    const validPoints = points.filter(
      (point): point is ChartPoint & { y: number; averageMood: number } =>
        point.y !== null && typeof point.averageMood === 'number'
    );

    const baselineY = HEIGHT - PADDING.bottom;

    const toFixed = (value: number) => Number(value.toFixed(2));

    let linePath = '';
    validPoints.forEach((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      linePath += `${command}${toFixed(point.x)} ${toFixed(point.y)} `;
    });
    if (validPoints.length === 1) {
      const point = validPoints[0];
      linePath += `L${toFixed(point.x)} ${toFixed(point.y)} `;
    }
    linePath = linePath.trim();

    let areaPath = '';
    if (validPoints.length > 0) {
      areaPath = `M${toFixed(validPoints[0].x)} ${toFixed(baselineY)} `;
      validPoints.forEach((point) => {
        areaPath += `L${toFixed(point.x)} ${toFixed(point.y)} `;
      });
      areaPath += `L${toFixed(validPoints[validPoints.length - 1].x)} ${toFixed(baselineY)} Z`;
    }

    const gridLines = GRID_VALUES.map((value) => ({
      value,
      y: mapMoodToY(value),
    }));

    const labelStep =
      data.length > 8 ? Math.ceil(data.length / 6) : data.length > 4 ? 2 : 1;

    const axisLabels = points
      .map((point, index) => ({ ...point, index }))
      .filter(
        (point, index) =>
          index % labelStep === 0 ||
          index === data.length - 1 ||
          data.length <= 4
      );

    return {
      points,
      validPoints,
      gridLines,
      baselineY,
      axisLabels,
      linePath,
      areaPath,
    };
  }, [data]);

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
        <desc>過去の平均気分を折れ線グラフで表示します。</desc>
        <defs>
          <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.35)" />
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
              y={line.y + 2}
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
        {chart.validPoints.map((point) => {
          const label =
            MOOD_LABEL_MAP[Math.round(point.averageMood)] || 'ふつう';
          return (
            <g key={`point-${point.dateLabel}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={1.6}
                className="fill-white dark:fill-gray-900 stroke-primary-500 dark:stroke-primary-300"
                strokeWidth={0.7}
              >
                <title>
                  {`${point.dateLabel}: 平均 ${point.averageMood.toFixed(1)} (${label})`}
                </title>
              </circle>
              <circle
                cx={point.x}
                cy={point.y}
                r={0.8}
                className="fill-primary-500 dark:fill-primary-300"
              />
            </g>
          );
        })}

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
