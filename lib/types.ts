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
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Memo {
  id: string;
  userId: string;
  content: string;
  mood?: number; // 気分スコア 1-5（任意）
  imageUrl?: string;
  createdAt: Timestamp;
}

export interface MemoFormData {
  content: string;
  mood?: number; // 気分スコア 1-5（任意）
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
  imageUrl?: string;
  entryDate?: string; // YYYY-MM-DD形式、過去の日付のみ許可
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

// 健康ログ（1日1回）
export interface HealthLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD形式（その日を一意に識別）
  sleepDuration: number; // 睡眠時間（分単位）
  hrv: number; // 心拍変動（HRV）
  minHeartRate: number; // 睡眠時最低心拍数
  steps: number; // 歩数
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HealthLogFormData {
  date: string; // YYYY-MM-DD形式
  sleepDuration: number; // 睡眠時間（分単位）
  hrv: number;
  minHeartRate: number;
  steps: number;
}

// 問いかけ型日記（Daily Question）
export interface Question {
  id: number;
  text: string;
  depth: number; // 1=軽い, 2=中程度, 3=深い
  categoryId: string;
  categoryName: string;
}

export interface QuestionAnswer {
  id: string;
  userId: string;
  questionId: number;
  questionText: string;
  questionCategoryName: string;
  questionDepth: number;
  answer: string;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

export interface QuestionAnswerFormData {
  questionId: number;
  questionText: string;
  questionCategoryName: string;
  questionDepth: number;
  answer: string;
  date: string; // YYYY-MM-DD
}

