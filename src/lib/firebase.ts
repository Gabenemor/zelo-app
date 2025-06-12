
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
console.log(`  NEXT_PUBLIC_FIREBASE_DATABASE_ID: ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID}`);


const firebaseConfig: FirebaseOptions = firebaseConfigValues;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage =
    `[Firebase SDK] CRITICAL ERROR: Firebase client-side configuration is missing or incomplete. ` +
    `NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is undefined. ` +
    `Please ensure these environment variables are correctly set in your .env.local file (for local dev) or App Hosting environment variables. ` +
    `Current values - API Key: ${firebaseConfig.apiKey}, Project ID: ${firebaseConfig.projectId}. ` +
    `Firebase services will not work correctly.`;
  console.error('--------------------------------------------------------------------');
  console.error(errorMessage);
  console.error('--------------------------------------------------------------------');
  throw new Error(errorMessage);
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log(`[Firebase SDK] Firebase app initialized or retrieved: ${app.name} for project: ${firebaseConfig.projectId}`);

// Initialize Firebase services
export const auth = getAuth(app);
console.log('[Firebase SDK] Firebase Auth service instance created.');

const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
export const db = databaseId && databaseId !== "(default)" && databaseId.trim() !== ""
  ? getFirestore(app, databaseId)
  : getFirestore(app);

if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
  console.log(`[Firebase SDK] Firebase Firestore service instance created for Database ID: "${databaseId}".`);
} else {
  console.log('[Firebase SDK] Firebase Firestore service instance created for the (default) database.');
}

export const storage = getStorage(app);
console.log('[Firebase SDK] Firebase Storage service instance created.');
export const functions = getFunctions(app);
console.log('[Firebase SDK] Firebase Functions service instance created.');

// Ensure emulators are NOT connected when pointing to a live test environment
const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

if (USE_EMULATORS && process.env.NODE_ENV === 'development') {
  const emulatorHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
  console.warn(`[Firebase SDK] DEVELOPMENT MODE & USE_EMULATORS=true: Attempting to connect to emulators on host: ${emulatorHost}`);
  console.warn('--------------------------------------------------------------------');
  
  try {
    console.log(`[Firebase SDK] Attempting to connect to Auth Emulator on http://${emulatorHost}:9099...`);
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
    console.log('[Firebase SDK] Auth Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Auth Emulator connection: ${error.message}`);
  }

  try {
    console.log(`[Firebase SDK] Attempting to connect to Firestore Emulator on ${emulatorHost}:8080...`);
    // For Firestore emulator, if a specific databaseId is intended for emulation, it might need to be passed
    // to connectFirestoreEmulator depending on the version and setup.
    // However, typically, the emulator hosts all databases under the same project.
    // Check Firebase docs if issues arise with multi-DB emulation.
    connectFirestoreEmulator(db, emulatorHost, 8080);
    console.log('[Firebase SDK] Firestore Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Firestore Emulator connection: ${error.message}`);
  }

  try {
    console.log(`[Firebase SDK] Attempting to connect to Storage Emulator on ${emulatorHost}:9199...`);
    connectStorageEmulator(storage, emulatorHost, 9199);
    console.log('[Firebase SDK] Storage Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Storage Emulator connection: ${error.message}`);
  }

  try {
    console.log(`[Firebase SDK] Attempting to connect to Functions Emulator on ${emulatorHost}:5001...`);
    connectFunctionsEmulator(functions, emulatorHost, 5001);
    console.log('[Firebase SDK] Functions Emulator connection attempt made.');
  } catch (error: any) {
    console.warn(`[Firebase SDK] Warning: Error during Functions Emulator connection: ${error.message}`);
  }
  console.warn('--------------------------------------------------------------------');
} else {
  console.log('[Firebase SDK] Connecting to LIVE Firebase services (Emulators are OFF or NEXT_PUBLIC_USE_FIREBASE_EMULATORS is not "true").');
  console.log(`[Firebase SDK] Target Project ID: ${firebaseConfig.projectId}`);
  if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
    console.log(`[Firebase SDK] Target Firestore Database ID: "${databaseId}"`);
  } else {
    console.log(`[Firebase SDK] Target Firestore Database ID: (default)`);
  }
}

export default app;
