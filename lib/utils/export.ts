import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Entry, Memo, HealthLog } from '@/lib/types';

export function entriesToText(entries: Entry[]): string {
  return entries
    .map((entry) => {
      const date = entry.createdAt.toDate();
      const time = format(date, 'HH:mm', { locale: ja });
      const title = entry.title ? `【${entry.title}】` : '';
      return `${time} ${title}\n${entry.content}`;
    })
    .join('\n\n---\n\n');
}

export function entriesToCSV(entries: Entry[]): string {
  const headers = ['日時', 'タイトル', '本文', 'タグ'];
  const rows = entries.map((entry) => {
    const date = entry.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const title = entry.title || '';
    const content = `"${entry.content.replace(/"/g, '""')}"`;
    const tags = entry.tags?.join(';') || '';
    return [dateStr, title, content, tags].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('クリップボードコピーエラー:', error);
    throw error;
  }
}

export function memosToCSV(memos: Memo[]): string {
  const headers = ['日時', '気分', '内容', '画像URL'];
  const rows = memos.map((memo) => {
    const date = memo.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const mood = memo.mood !== undefined ? memo.mood.toString() : '';
    const content = `"${memo.content.replace(/"/g, '""')}"`;
    const imageUrl = memo.imageUrl || '';
    return [dateStr, mood, content, imageUrl].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export function memosToText(memos: Memo[]): string {
  return memos
    .map((memo) => {
      const date = memo.createdAt.toDate();
      const dateStr = format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
      const moodText = memo.mood !== undefined ? ` ${MOOD_EMOJI[memo.mood] || ''}` : '';
      const imageText = memo.imageUrl ? ' [画像あり]' : '';
      return `${dateStr}${moodText}${imageText}\n${memo.content}`;
    })
    .join('\n\n---\n\n');
}

export function unifiedToCSV(entries: Entry[], memos: Memo[]): string {
  const headers = ['種類', '日時', 'タイトル', '本文', 'タグ', '気分', '画像URL'];

  const entryRows = entries.map((entry) => {
    const date = entry.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const title = entry.title || '';
    const content = `"${entry.content.replace(/"/g, '""')}"`;
    const tags = entry.tags?.join(';') || '';
    const imageUrl = entry.imageUrl || '';
    return ['投稿', dateStr, title, content, tags, '', imageUrl].join(',');
  });

  const memoRows = memos.map((memo) => {
    const date = memo.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const content = `"${memo.content.replace(/"/g, '""')}"`;
    const mood = memo.mood !== undefined ? memo.mood.toString() : '';
    const imageUrl = memo.imageUrl || '';
    return ['断片', dateStr, '', content, '', mood, imageUrl].join(',');
  });

  const allRows = [...entryRows, ...memoRows].sort((a, b) => {
    const dateA = a.split(',')[1];
    const dateB = b.split(',')[1];
    return dateB.localeCompare(dateA);
  });

  return [headers.join(','), ...allRows].join('\n');
}

// 健康ログをCSV形式に変換
export function healthLogsToCSV(logs: HealthLog[]): string {
  const headers = ['日付', '睡眠時間(分)', '睡眠時間(時間)', 'HRV(ms)', '最低心拍数(bpm)', '歩数'];

  const rows = logs.map((log) => {
    const sleepHours = (log.sleepDuration / 60).toFixed(1);
    return [
      log.date,
      log.sleepDuration.toString(),
      sleepHours,
      log.hrv.toString(),
      log.minHeartRate.toString(),
      log.steps.toString(),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

