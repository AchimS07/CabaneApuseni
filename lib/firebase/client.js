import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAZGvVi1dpVXsT2lMco466wzwBzEUIAY_w',
  authDomain: 'apusenirental.firebaseapp.com',
  projectId: 'apusenirental',
  storageBucket: 'apusenirental.firebasestorage.app',
  messagingSenderId: '712212349332',
  appId: '1:712212349332:web:ea189aa27fcb084d490f81',
  measurementId: 'G-E0PGE7D8H7'
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function initializeFirebaseAnalytics() {
  if (typeof window === 'undefined') {
    return null;
  }

  const analyticsSupported = await isSupported();
  if (!analyticsSupported) {
    return null;
  }

  return getAnalytics(firebaseApp);
}
