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
}
