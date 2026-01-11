import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { WeeklyReview, WeeklyReviewFormData } from '@/lib/types';

const COLLECTION_NAME = 'weeklyReviews';

/**
 * 指定した日付が属する週の日曜日を取得
 */
export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 今日が日曜日かどうか
 */
export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}

/**
 * 週次振り返りを作成
 */
export async function createWeeklyReview(
  userId: string,
  data: WeeklyReviewFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();
  const weekStartDate = getWeekStartDate();

  const reviewData = {
    userId,
    weekStartDate: Timestamp.fromDate(weekStartDate),
    stabilityScore: data.stabilityScore,
    stimulationScore: data.stimulationScore,
    nextWeekTask: data.nextWeekTask,
    freeMemo: data.freeMemo || '',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), reviewData);
  return docRef.id;
}

/**
 * 週次振り返りを更新
 */
export async function updateWeeklyReview(
  reviewId: string,
  data: Partial<WeeklyReviewFormData>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const reviewRef = doc(db, COLLECTION_NAME, reviewId);
  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (data.stabilityScore !== undefined) {
    updateData.stabilityScore = data.stabilityScore;
  }
  if (data.stimulationScore !== undefined) {
    updateData.stimulationScore = data.stimulationScore;
  }
  if (data.nextWeekTask !== undefined) {
    updateData.nextWeekTask = data.nextWeekTask;
  }
  if (data.freeMemo !== undefined) {
    updateData.freeMemo = data.freeMemo;
  }

  await updateDoc(reviewRef, updateData);
}

/**
 * 特定の週の振り返りを取得
 */
export async function getWeeklyReviewForWeek(
  userId: string,
  weekStart: Date
): Promise<WeeklyReview | null> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const startOfWeek = getWeekStartDate(weekStart);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 1); // 日曜日の翌日まで

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('weekStartDate', '>=', Timestamp.fromDate(startOfWeek)),
    where('weekStartDate', '<', Timestamp.fromDate(endOfWeek))
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as WeeklyReview;
}

/**
 * 今週の振り返りを取得
 */
export async function getCurrentWeekReview(
  userId: string
): Promise<WeeklyReview | null> {
  return getWeeklyReviewForWeek(userId, new Date());
}

/**
 * ユーザーの全振り返りを取得（履歴用）
 */
export async function getWeeklyReviewsByUser(
  userId: string
): Promise<WeeklyReview[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('weekStartDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as WeeklyReview[];
}

/**
 * 週次振り返りのプロンプトを表示すべきか判定
 * - 日曜日で、今週の振り返りがまだ書かれていない場合にtrue
 */
export async function shouldShowWeeklyReviewPrompt(
  userId: string
): Promise<boolean> {
  // 日曜日でなければ表示しない（デバッグ用にコメントアウト可能）
  // if (!isSunday()) {
  //   return false;
  // }

  const currentReview = await getCurrentWeekReview(userId);
  return currentReview === null;
}
