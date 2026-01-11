import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  displayName?: string;
  createdAt: Timestamp;
}

export interface Entry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  tags?: string[];
  weather?: string;
  mood?: number | null;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Memo {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

export interface MemoFormData {
  content: string;
  imageUrl?: string;
}

export interface EntryExport {
  id: string;
  userId: string;
  rangeStart: Timestamp;
  rangeEnd: Timestamp;
  createdAt: Timestamp;
  downloadUrl?: string;
}

export interface EntryFormData {
  title?: string;
  content: string;
  tags?: string[];
  weather?: string;
  mood?: number | null;
  imageUrl?: string;
}

// 未来への手紙
export type LetterPeriod = 'short' | 'medium' | 'long' | 'custom';

export interface FutureLetter {
  id: string;
  userId: string;
  title: string;
  content: string;
  period: LetterPeriod;
  deliveryDate: Timestamp;
  isOpened: boolean;
  openedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface FutureLetterFormData {
  title: string;
  content: string;
  period: LetterPeriod;
  customDate?: string; // YYYY-MM-DD形式
}

// 週次振り返り
export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: Timestamp; // その週の日曜日
  stabilityScore: number; // 安定スコア (0-10)
  stimulationScore: number; // 刺激スコア (0-10)
  nextWeekTask: string; // 来週やること（1つ）
  freeMemo?: string; // 自由メモ（任意）
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeeklyReviewFormData {
  stabilityScore: number;
  stimulationScore: number;
  nextWeekTask: string;
  freeMemo?: string;
}
