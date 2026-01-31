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
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { HealthLog, HealthLogFormData } from '@/lib/types';

const COLLECTION_NAME = 'healthLogs';

export async function createHealthLog(
  userId: string,
  data: HealthLogFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();

  const healthLogData = {
    userId,
    date: data.date,
    sleepDuration: data.sleepDuration,
    hrv: data.hrv,
    minHeartRate: data.minHeartRate,
    steps: data.steps,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), healthLogData);
  return docRef.id;
}

export async function updateHealthLog(
  healthLogId: string,
  data: Partial<HealthLogFormData>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const healthLogRef = doc(db, COLLECTION_NAME, healthLogId);

  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (data.sleepDuration !== undefined) {
    updateData.sleepDuration = data.sleepDuration;
  }
  if (data.hrv !== undefined) {
    updateData.hrv = data.hrv;
  }
  if (data.minHeartRate !== undefined) {
    updateData.minHeartRate = data.minHeartRate;
  }
  if (data.steps !== undefined) {
    updateData.steps = data.steps;
  }

  await updateDoc(healthLogRef, updateData);
}

export async function deleteHealthLog(healthLogId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const healthLogRef = doc(db, COLLECTION_NAME, healthLogId);
  await deleteDoc(healthLogRef);
}

export async function getHealthLog(healthLogId: string): Promise<HealthLog | null> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const healthLogRef = doc(db, COLLECTION_NAME, healthLogId);
  const healthLogSnap = await getDoc(healthLogRef);

  if (!healthLogSnap.exists()) {
    return null;
  }

  return {
    id: healthLogSnap.id,
    ...healthLogSnap.data(),
  } as HealthLog;
}

export async function getHealthLogsByUser(userId: string): Promise<HealthLog[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthLog[];
}

export async function getHealthLogByDate(
  userId: string,
  date: string
): Promise<HealthLog | null> {
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
  } as HealthLog;
}

export async function getHealthLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HealthLog[]> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthLog[];
}
