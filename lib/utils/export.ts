import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Entry, Memo } from '@/lib/types';

export function entriesToText(entries: Entry[]): string {
  return entries
    .map((entry) => {
      const date = entry.createdAt.toDate();
      const time = format(date, 'HH:mm', { locale: ja });
      const title = entry.title ? `【${entry.title}】` : '';
      const moodText =
        typeof entry.mood === 'number' ? `気分 ${entry.mood}` : '';
      const weatherText = entry.weather ? `天気 ${entry.weather}` : '';
      const meta = [moodText, weatherText]
        .filter(Boolean)
        .join(' / ');

      const metaLine = meta ? `\n${meta}` : '';
      return `${time} ${title}\n${entry.content}${metaLine}`;
    })
    .join('\n\n---\n\n');
}

export function entriesToCSV(entries: Entry[]): string {
  const headers = ['日時', 'タイトル', '本文', 'タグ', '天気', '気分スコア'];
  const rows = entries.map((entry) => {
    const date = entry.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const title = entry.title || '';
    const content = `"${entry.content.replace(/"/g, '""')}"`;
    const tags = entry.tags?.join(';') || '';
    const weather = entry.weather || '';
    const mood = typeof entry.mood === 'number' ? entry.mood.toString() : '';
    return [dateStr, title, content, tags, weather, mood].join(',');
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
  const headers = ['日時', '内容', '画像URL'];
  const rows = memos.map((memo) => {
    const date = memo.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const content = `"${memo.content.replace(/"/g, '""')}"`;
    const imageUrl = memo.imageUrl || '';
    return [dateStr, content, imageUrl].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function memosToText(memos: Memo[]): string {
  return memos
    .map((memo) => {
      const date = memo.createdAt.toDate();
      const dateStr = format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
      const imageText = memo.imageUrl ? ' [画像あり]' : '';
      return `${dateStr}${imageText}\n${memo.content}`;
    })
    .join('\n\n---\n\n');
}
