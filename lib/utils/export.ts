import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Learning } from '@/lib/types';

export function learningsToText(learnings: Learning[]): string {
  return learnings
    .map((l) => {
      const date = l.createdAt.toDate();
      const dateStr = format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
      const tags = l.tags?.length ? ` [${l.tags.join(', ')}]` : '';
      const source = l.source ? `\n出典: ${l.source}` : '';
      return `${dateStr}${tags}\n${l.content}${source}`;
    })
    .join('\n\n---\n\n');
}

export function learningsToCSV(learnings: Learning[]): string {
  const headers = ['日時', '内容', 'タグ', '出典'];
  const rows = learnings.map((l) => {
    const date = l.createdAt.toDate();
    const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ja });
    const content = `"${l.content.replace(/"/g, '""')}"`;
    const tags = l.tags?.join(';') || '';
    const source = l.source || '';
    return [dateStr, content, tags, source].join(',');
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
  await navigator.clipboard.writeText(text);
}
