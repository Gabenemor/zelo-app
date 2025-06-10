
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
// This helps to give a more specific error if environment variables are not set up correctly.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage =
    'Firebase client-side configuration error: NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. ' +
    'Please ensure these environment variables are correctly set. For local development, create a .env.local file in your project root ' +
    'and add your Firebase web app configuration values prefixed with NEXT_PUBLIC_ (e.g., NEXT_PUBLIC_FIREBASE_API_KEY="your-key"). ' +
    'For deployed environments, configure these environment variables in your hosting provider settings.';
  console.error(errorMessage);
  // Throwing an error here makes the problem immediately obvious during development.
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
  try {
    // Connect to Auth emulator
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    
    // Connect to Firestore emulator
    // Check if db is already connected or if _delegate exists and has _databaseId
    if (db && db._delegate && db._delegate._databaseId && !db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Connect to Storage emulator
    if (storage && storage._location && !storage._location.bucket.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    // Connect to Functions emulator
    if (functions && !functions.customDomain) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  } catch (error) {
    console.warn('Error connecting to Firebase emulators (they might already be connected or not running):', error);
  }
}

export default app;
