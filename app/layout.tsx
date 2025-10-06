import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogBook - 日記アプリ',
  description: '個人専用の日記ログアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
