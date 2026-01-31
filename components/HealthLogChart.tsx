'use client';

import { useId, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { HealthLog } from '@/lib/types';

interface HealthLogChartProps {
  data: HealthLog[];
  metric: 'sleepDuration' | 'hrv' | 'minHeartRate' | 'steps';
}

const METRIC_CONFIG = {
  sleepDuration: {
    label: '睡眠時間',
    unit: '時間',
    color: '#8b5cf6',
    formatValue: (v: number) => (v / 60).toFixed(1),
  },
  hrv: {
    label: 'HRV',
    unit: 'ms',
    color: '#10b981',
    formatValue: (v: number) => v.toString(),
  },
  minHeartRate: {
    label: '最低心拍数',
    unit: 'bpm',
    color: '#ef4444',
    formatValue: (v: number) => v.toString(),
  },
  steps: {
    label: '歩数',
    unit: '歩',
    color: '#f59e0b',
    formatValue: (v: number) => v.toLocaleString(),
  },
};

const WIDTH = 100;
const HEIGHT = 60;
const PADDING = { top: 10, right: 8, bottom: 14, left: 12 };

export default function HealthLogChart({ data, metric }: HealthLogChartProps) {
  const gradientId = useId();
  const config = METRIC_CONFIG[metric];

  const chart = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    const values = data.map((log) => log[metric]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;

    const mapX = (index: number) => {
      if (data.length <= 1) {
        return PADDING.left + plotWidth / 2;
      }
      const ratio = index / (data.length - 1);
      return PADDING.left + ratio * plotWidth;
    };

    const mapY = (value: number) => {
      const ratio = (value - minValue) / range;
      return PADDING.top + (1 - ratio) * plotHeight;
    };

    const points = data.map((log, index) => ({
      x: mapX(index),
      y: mapY(log[metric]),
      value: log[metric],
      date: log.date,
    }));

    const toFixed = (value: number) => Number(value.toFixed(2));

    let linePath = '';
    points.forEach((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      linePath += `${command}${toFixed(point.x)} ${toFixed(point.y)} `;
    });
    linePath = linePath.trim();

    const baselineY = HEIGHT - PADDING.bottom;
    let areaPath = '';
    if (points.length > 0) {
      areaPath = `M${toFixed(points[0].x)} ${toFixed(baselineY)} `;
      points.forEach((point) => {
        areaPath += `L${toFixed(point.x)} ${toFixed(point.y)} `;
      });
      areaPath += `L${toFixed(points[points.length - 1].x)} ${toFixed(baselineY)} Z`;
    }

    const labelStep = data.length > 8 ? Math.ceil(data.length / 6) : data.length > 4 ? 2 : 1;
    const axisLabels = points.filter(
      (_, index) => index % labelStep === 0 || index === data.length - 1
    );

    return {
      points,
      linePath,
      areaPath,
      baselineY,
      axisLabels,
      minValue,
      maxValue,
    };
  }, [data, metric]);

  if (!chart || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white/40 dark:bg-gray-800/40">
        データがありません
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        role="img"
        aria-label={`${config.label}の推移グラフ`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-48 sm:h-56"
      >
        <title>{config.label}推移</title>
        <defs>
          <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.color} />
            <stop offset="100%" stopColor={config.color} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={config.color} stopOpacity={0} />
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
        {chart.points.map((point) => (
          <g key={`point-${point.date}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={1.6}
              className="fill-white dark:fill-gray-900"
              stroke={config.color}
              strokeWidth={0.7}
            >
              <title>
                {`${format(new Date(point.date), 'MM/dd', { locale: ja })}: ${config.formatValue(point.value)}${config.unit}`}
              </title>
            </circle>
            <circle cx={point.x} cy={point.y} r={0.8} fill={config.color} />
          </g>
        ))}

        {/* X軸ラベル */}
        {chart.axisLabels.map((point) => (
          <g key={`label-${point.date}`} transform={`translate(${point.x}, ${chart.baselineY})`}>
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
              {format(new Date(point.date), 'MM/dd', { locale: ja })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// 複数メトリクスを切り替えて表示するコンポーネント
export function HealthLogChartPanel({ data }: { data: HealthLog[] }) {
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof METRIC_CONFIG>('sleepDuration');

  const metrics: { key: keyof typeof METRIC_CONFIG; label: string }[] = [
    { key: 'sleepDuration', label: '睡眠' },
    { key: 'hrv', label: 'HRV' },
    { key: 'minHeartRate', label: '心拍' },
    { key: 'steps', label: '歩数' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {metrics.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedMetric === key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <HealthLogChart data={data} metric={selectedMetric} />
    </div>
  );
}
