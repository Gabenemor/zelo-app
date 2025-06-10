
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

console.log('--------------------------------------------------------------------');
console.log('[Firebase SDK] Initializing Firebase Client SDK...');
console.log(`[Firebase SDK] NODE_ENV: ${process.env.NODE_ENV}`);
console.log('[Firebase SDK] NOTE: Check the output/console in Firebase Studio for these logs.');
console.log('--------------------------------------------------------------------');

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('[Firebase SDK] Values for firebaseConfig from environment variables:');
console.log(`  NEXT_PUBLIC_FIREBASE_API_KEY: ${firebaseConfigValues.apiKey}`);
console.log(`  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${firebaseConfigValues.authDomain}`);
console.log(`  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${firebaseConfigValues.projectId}`);
console.log(`  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${firebaseConfigValues.storageBucket}`);
console.log(`  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${firebaseConfigValues.messagingSenderId}`);
console.log(`  NEXT_PUBLIC_FIREBASE_APP_ID: ${firebaseConfigValues.appId}`);

const firebaseConfig: FirebaseOptions = firebaseConfigValues;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage =
    `[Firebase SDK] CRITICAL ERROR: Firebase client-side configuration is missing or incomplete. ` +
    `NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is undefined. ` +
    `Please ensure these environment variables are correctly set in your .env.local file and that the Next.js development server was restarted. ` +
    `Current values - API Key: ${firebaseConfig.apiKey}, Project ID: ${firebaseConfig.projectId}. ` +
    `Firebase services will not work correctly.`;
  console.error('--------------------------------------------------------------------');
  console.error(errorMessage);
  console.error('--------------------------------------------------------------------');
  // Throwing an error here will stop further execution and should be visible in the Studio.
  throw new Error(errorMessage);
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log(`[Firebase SDK] Firebase app initialized or retrieved: ${app.name}`);

// Initialize Firebase services
export const auth = getAuth(app);
console.log('[Firebase SDK] Firebase Auth service instance created.');
export const db = getFirestore(app);
console.log('[Firebase SDK] Firebase Firestore service instance created.');
export const storage = getStorage(app);
console.log('[Firebase SDK] Firebase Storage service instance created.');
export const functions = getFunctions(app);
console.log('[Firebase SDK] Firebase Functions service instance created.');

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  console.log('--------------------------------------------------------------------');
  console.log('[Firebase SDK] Development mode detected. Attempting to connect to emulators...');
  
  try {
    console.log('[Firebase SDK] Attempting to connect to Auth Emulator on http://localhost:9099...');
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('[Firebase SDK] Auth Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Auth Emulator connection attempt (is it running?): ${error.message}`);
  }

  try {
    console.log('[Firebase SDK] Attempting to connect to Firestore Emulator on localhost:8080...');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('[Firebase SDK] Firestore Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Firestore Emulator connection attempt (is it running?): ${error.message}`);
  }

  try {
    console.log('[Firebase SDK] Attempting to connect to Storage Emulator on localhost:9199...');
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('[Firebase SDK] Storage Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Storage Emulator connection attempt (is it running?): ${error.message}`);
  }

  try {
    console.log('[Firebase SDK] Attempting to connect to Functions Emulator on localhost:5001...');
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('[Firebase SDK] Functions Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Functions Emulator connection attempt (is it running?): ${error.message}`);
  }
  console.log('--------------------------------------------------------------------');
} else {
  console.log('[Firebase SDK] Production mode or emulators not explicitly configured for this environment.');
}

export default app;
