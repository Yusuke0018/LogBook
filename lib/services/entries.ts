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
import type { Entry, EntryFormData } from '@/lib/types';

const COLLECTION_NAME = 'entries';

export async function createEntry(
  userId: string,
  data: EntryFormData
): Promise<string> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const now = Timestamp.now();
  const entryData = {
    userId,
    title: data.title || '',
    content: data.content,
    tags: data.tags || [],
    weather: data.weather || '',
    mood: data.mood ?? null,
    conditions: data.conditions || [],
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), entryData);
  return docRef.id;
}

export async function updateEntry(
  entryId: string,
  data: Partial<EntryFormData>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const entryRef = doc(db, COLLECTION_NAME, entryId);

  // undefinedの値を除外
  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.content !== undefined) {
    updateData.content = data.content;
  }
  if (data.tags !== undefined) {
    updateData.tags = data.tags;
  }
  if (data.weather !== undefined) {
    updateData.weather = data.weather;
  }
  if (data.mood !== undefined) {
    updateData.mood = data.mood;
  }
  if (data.conditions !== undefined) {
    updateData.conditions = data.conditions;
  }

  await updateDoc(entryRef, updateData);
}

export async function deleteEntry(entryId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const entryRef = doc(db, COLLECTION_NAME, entryId);
  await deleteDoc(entryRef);
}

export async function getEntry(entryId: string): Promise<Entry | null> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const entryRef = doc(db, COLLECTION_NAME, entryId);
  const entrySnap = await getDoc(entryRef);

  if (!entrySnap.exists()) {
    return null;
  }

  return {
    id: entrySnap.id,
    ...entrySnap.data(),
  } as Entry;
}

export async function getEntriesByUser(userId: string): Promise<Entry[]> {
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
  })) as Entry[];
}

export async function getEntriesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Entry[]> {
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
  })) as Entry[];
}

export function entryMatchesSearchTerm(entry: Entry, searchTerm: string) {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const targets: string[] = [
    entry.content,
    entry.title || '',
    entry.weather || '',
  ];

  if (entry.tags) {
    targets.push(...entry.tags);
  }

  if (entry.conditions) {
    targets.push(...entry.conditions);
  }

  return targets
    .map((value) => value.toLowerCase())
    .some((value) => value.includes(normalized));
}

export async function searchEntries(
  userId: string,
  searchTerm: string,
  sourceEntries?: Entry[]
): Promise<Entry[]> {
  const entries = sourceEntries || (await getEntriesByUser(userId));
  if (!searchTerm.trim()) {
    return entries;
  }

  return entries.filter((entry) => entryMatchesSearchTerm(entry, searchTerm));
}
