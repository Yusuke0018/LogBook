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
  createdAt: Timestamp;
}

export interface MemoFormData {
  content: string;
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
