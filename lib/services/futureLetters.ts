import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { FutureLetter, FutureLetterFormData, LetterPeriod } from '@/lib/types';

const COLLECTION_NAME = 'futureLetters';

// 期間に応じたランダム日付を生成
function generateRandomDeliveryDate(period: LetterPeriod): Date {
  const now = new Date();
  let minDays: number;
  let maxDays: number;

  switch (period) {
    case 'short':
      // 短期: 1ヶ月後〜半年後
      minDays = 30;
      maxDays = 180;
      break;
    case 'medium':
      // 中期: 半年後〜1年後
      minDays = 180;
      maxDays = 365;
      break;
    case 'long':
      // 長期: 1年後〜2年後
      minDays = 365;
      maxDays = 730;
      break;
    case 'custom':
      // カスタムの場合はこの関数は呼ばれない
      throw new Error('Custom period requires customDate');
  }

  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + randomDays);
  return deliveryDate;
}

export async function createFutureLetter(
  userId: string,
  data: FutureLetterFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();

  // カスタム日付の場合は指定日付を使用、それ以外はランダム生成
  let deliveryDate: Date;
  if (data.period === 'custom' && data.customDate) {
    deliveryDate = new Date(data.customDate);
  } else {
    deliveryDate = generateRandomDeliveryDate(data.period);
  }

  const letterData = {
    userId,
    title: data.title,
    content: data.content,
    period: data.period,
    deliveryDate: Timestamp.fromDate(deliveryDate),
    isOpened: false,
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), letterData);
  return docRef.id;
}

export async function openFutureLetter(letterId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const letterRef = doc(db, COLLECTION_NAME, letterId);
  await updateDoc(letterRef, {
    isOpened: true,
    openedAt: Timestamp.now(),
  });
}

export async function deleteFutureLetter(letterId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const letterRef = doc(db, COLLECTION_NAME, letterId);
  await deleteDoc(letterRef);
}

export async function getFutureLettersByUser(userId: string): Promise<FutureLetter[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('deliveryDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FutureLetter[];
}

// 届いた手紙（配達日が今日以前）を取得
export async function getDeliveredLetters(userId: string): Promise<FutureLetter[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('deliveryDate', '<=', now),
    orderBy('deliveryDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FutureLetter[];
}

// 未開封の届いた手紙の数を取得
export async function getUnreadLettersCount(userId: string): Promise<number> {
  const letters = await getDeliveredLetters(userId);
  return letters.filter(letter => !letter.isOpened).length;
}

// 待機中の手紙（まだ届いていない）を取得
export async function getPendingLetters(userId: string): Promise<FutureLetter[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('deliveryDate', '>', now),
    orderBy('deliveryDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FutureLetter[];
}
