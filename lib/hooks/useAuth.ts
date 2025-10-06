'use client';

import { useEffect, useState } from 'react';
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google認証エラー:', error);
      throw error;
    }
  };

  const signInAnonymous = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('匿名認証エラー:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      await auth.signOut();
    } catch (error) {
      console.error('サインアウトエラー:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInAnonymous,
    signOut,
  };
}
