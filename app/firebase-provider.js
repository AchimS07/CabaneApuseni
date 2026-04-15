'use client';

import { useEffect } from 'react';
import { initializeFirebaseAnalytics } from '../lib/firebase/client';

export default function FirebaseProvider() {
  useEffect(() => {
    void initializeFirebaseAnalytics().catch((error) => {
      console.error('Firebase initialization failed:', error);
    });
  }, []);

  return null;
}
