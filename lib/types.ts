import { Timestamp } from 'firebase/firestore';

export interface Learning {
  id: string;
  userId: string;
  content: string;
  tags?: string[];
  source?: string;
  createdAt: Timestamp;
}

export interface LearningFormData {
  content: string;
  tags?: string[];
  source?: string;
  date?: string; // YYYY-MM-DD形式（任意、未指定なら現在時刻）
}
