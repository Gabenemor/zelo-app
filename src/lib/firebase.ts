
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

console.log('--------------------------------------------------------------------');
console.log('[Firebase SDK] Initializing Firebase Client SDK...');
console.log(`[Firebase SDK] NODE_ENV: ${process.env.NODE_ENV}`);
console.log('[Firebase SDK] NOTE: Check the output/console in Firebase Studio for these logs.');
console.log('--------------------------------------------------------------------');

let firebaseConfig: FirebaseOptions = {};
const webAppConfigString = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;

if (webAppConfigString) {
  try {
    console.log('[Firebase SDK] Attempting to parse NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG.');
    firebaseConfig = JSON.parse(webAppConfigString);
    console.log('[Firebase SDK] Successfully parsed NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG:', firebaseConfig);
  } catch (error) {
    console.error('[Firebase SDK] Failed to parse NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG:', error, 'String was:', webAppConfigString);
    console.error('[Firebase SDK] Falling back to individual NEXT_PUBLIC_ variables if available.');
  }
}

// Fallback if NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is not available or parsing failed
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.log('[Firebase SDK] NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG not fully parsed or unavailable. Using individual NEXT_PUBLIC_ variables.');
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

console.log('[Firebase SDK] Final Firebase config being used for client-side initialization:');
console.log(`  apiKey: ${firebaseConfig.apiKey ? '***' : 'MISSING'}`); // Mask API key in logs
console.log(`  authDomain: ${firebaseConfig.authDomain}`);
console.log(`  projectId: ${firebaseConfig.projectId}`);
console.log(`  storageBucket: ${firebaseConfig.storageBucket}`);
console.log(`  messagingSenderId: ${firebaseConfig.messagingSenderId}`);
console.log(`  appId: ${firebaseConfig.appId}`);
console.log(`  NEXT_PUBLIC_FIREBASE_DATABASE_ID (for Firestore): ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID}`);


if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage =
    `[Firebase SDK] CRITICAL ERROR: Firebase client-side configuration is missing or incomplete. ` +
    `Ensure NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is set correctly in your environment, or individual NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are defined. ` +
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

const firestoreSettings: any = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
};

if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
  firestoreSettings.databaseId = databaseId;
  console.log(`[Firebase SDK] Preparing to initialize Firestore with Database ID: "${databaseId}".`);
} else {
  console.log('[Firebase SDK] Preparing to initialize Firestore with (default) database.');
}

export const db = initializeFirestore(app, firestoreSettings);

if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
  console.log(`[Firebase SDK] Firebase Firestore service instance initialized for Database ID: "${databaseId}".`);
} else {
  console.log('[Firebase SDK] Firebase Firestore service instance initialized for the (default) database.');
}

export const storage = getStorage(app);
console.log('[Firebase SDK] Firebase Storage service instance created.');
export const functions = getFunctions(app);
console.log('[Firebase SDK] Firebase Functions service instance created.');

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
