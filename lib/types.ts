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
