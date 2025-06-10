
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if essential config values are present.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage =
    'Firebase client-side configuration error: NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. ' +
    'Please ensure these environment variables are correctly set. For local development, create a .env.local file in your project root ' +
    'and add your Firebase web app configuration values prefixed with NEXT_PUBLIC_ (e.g., NEXT_PUBLIC_FIREBASE_API_KEY="your-key"). ' +
    'For deployed environments, configure these environment variables in your hosting provider settings.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  console.log('[Firebase SDK] Development mode detected. Attempting to connect to emulators...');
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('[Firebase SDK] Connected to Auth Emulator on port 9099.');
  } catch (error) {
    console.warn('[Firebase SDK] Error connecting to Auth Emulator (is it running?):', error);
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('[Firebase SDK] Connected to Firestore Emulator on port 8080.');
  } catch (error) {
    console.warn('[Firebase SDK] Error connecting to Firestore Emulator (is it running?):', error);
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('[Firebase SDK] Connected to Storage Emulator on port 9199.');
  } catch (error) {
    console.warn('[Firebase SDK] Error connecting to Storage Emulator (is it running?):', error);
  }

  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('[Firebase SDK] Connected to Functions Emulator on port 5001.');
  } catch (error) {
    console.warn('[Firebase SDK] Error connecting to Functions Emulator (is it running?):', error);
  }
}

export default app;
