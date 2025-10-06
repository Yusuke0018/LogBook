import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Entry } from '@/lib/types';

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
  const headers = ['日時', 'タイトル', '本文', 'タグ', '天気'];
  const rows = entries.map((entry) => {
    const date = entry.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const title = entry.title || '';
    const content = `"${entry.content.replace(/"/g, '""')}"`;
    const tags = entry.tags?.join(';') || '';
    const weather = entry.weather || '';
    return [dateStr, title, content, tags, weather].join(',');
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
