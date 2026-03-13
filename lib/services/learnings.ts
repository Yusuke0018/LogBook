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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Learning, LearningFormData } from '@/lib/types';

const COLLECTION_NAME = 'learnings';

export async function createLearning(
  userId: string,
  data: LearningFormData
): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized');

  let createdAt = Timestamp.now();
  if (data.date) {
    const d = new Date(data.date);
    const now = new Date();
    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    createdAt = Timestamp.fromDate(d);
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    content: data.content,
    tags: data.tags || [],
    source: data.source || '',
    createdAt,
  });
  return docRef.id;
}

export async function deleteLearning(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized');
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function getLearningsByUser(userId: string): Promise<Learning[]> {
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Learning[];
}

export function learningMatchesSearch(learning: Learning, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  const targets = [learning.content, learning.source || '', ...(learning.tags || [])];
  return targets.some((t) => t.toLowerCase().includes(normalized));
}
