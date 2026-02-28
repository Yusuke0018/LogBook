import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { QuestionAnswer, QuestionAnswerFormData } from '@/lib/types';

const COLLECTION_NAME = 'questionAnswers';

/**
 * 質問回答を作成
 */
export async function createQuestionAnswer(
  userId: string,
  data: QuestionAnswerFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const answerData = {
    userId,
    questionId: data.questionId,
    questionText: data.questionText,
    questionCategoryName: data.questionCategoryName,
    questionDepth: data.questionDepth,
    answer: data.answer,
    date: data.date,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), answerData);
  return docRef.id;
}

/**
 * ユーザーの全回答を取得（新しい順）
 */
export async function getQuestionAnswersByUser(
  userId: string
): Promise<QuestionAnswer[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as QuestionAnswer[];
}

/**
 * 特定の日付の回答を取得
 */
export async function getQuestionAnswerForDate(
  userId: string,
  date: string
): Promise<QuestionAnswer | null> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('date', '==', date)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as QuestionAnswer;
}

/**
 * 回答済みの質問IDリストを取得
 */
export async function getAnsweredQuestionIds(
  userId: string
): Promise<number[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().questionId as number);
}
