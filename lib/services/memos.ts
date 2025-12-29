import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
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
    imageUrl: data.imageUrl || '',
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

  // シンプルなクエリでユーザーのメモを取得（インデックス不要）
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const allMemos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Memo[];

  // クライアント側で並べ替えて件数制限
  return allMemos
    .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
    .slice(0, maxCount);
}

export async function getTodayMemos(userId: string): Promise<Memo[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // シンプルなクエリでユーザーのメモを取得（インデックス不要）
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const allMemos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Memo[];

  // クライアント側で今日のメモをフィルタして並べ替え
  return allMemos
    .filter((memo) => {
      const memoDate = memo.createdAt.toDate();
      return memoDate >= today && memoDate < tomorrow;
    })
    .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
}
