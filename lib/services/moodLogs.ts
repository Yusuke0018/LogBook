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
import type { MoodLog, MoodLogFormData } from '@/lib/types';
import { startOfDay, endOfDay } from 'date-fns';

const COLLECTION_NAME = 'moodLogs';

export async function createMoodLog(
  userId: string,
  data: MoodLogFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();

  const moodLogData = {
    userId,
    score: data.score,
    note: data.note || '',
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), moodLogData);
  return docRef.id;
}

export async function deleteMoodLog(moodLogId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const moodLogRef = doc(db, COLLECTION_NAME, moodLogId);
  await deleteDoc(moodLogRef);
}

export async function getMoodLogsByUser(userId: string, limit?: number): Promise<MoodLog[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const logs = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MoodLog[];

  return limit ? logs.slice(0, limit) : logs;
}

export async function getMoodLogsByDate(
  userId: string,
  date: Date
): Promise<MoodLog[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(dayStart)),
    where('createdAt', '<=', Timestamp.fromDate(dayEnd)),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MoodLog[];
}

export async function getMoodLogsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MoodLog[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MoodLog[];
}

// 日別の平均気分スコアを計算
export function calculateDailyAverageMood(moodLogs: MoodLog[]): { date: string; average: number }[] {
  const dailyMoods = new Map<string, number[]>();

  moodLogs.forEach((log) => {
    const date = log.createdAt.toDate().toISOString().split('T')[0];
    const existing = dailyMoods.get(date) || [];
    existing.push(log.score);
    dailyMoods.set(date, existing);
  });

  return Array.from(dailyMoods.entries())
    .map(([date, scores]) => ({
      date,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
