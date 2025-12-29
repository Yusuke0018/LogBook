import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Memo, MemoFormData } from '@/lib/types';

const COLLECTION_NAME = 'memos';

export async function createMemo(
  userId: string,
  data: MemoFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();
  const memoData = {
    userId,
    content: data.content.slice(0, 140), // 140文字制限
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), memoData);
  return docRef.id;
}

export async function deleteMemo(memoId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const memoRef = doc(db, COLLECTION_NAME, memoId);
  await deleteDoc(memoRef);
}

export async function getMemosByUser(
  userId: string,
  maxCount: number = 50
): Promise<Memo[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Memo[];
}

export async function getTodayMemos(userId: string): Promise<Memo[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(today)),
    where('createdAt', '<', Timestamp.fromDate(tomorrow)),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Memo[];
}
