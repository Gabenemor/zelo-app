
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let app;
let db: ReturnType<typeof getFirestore>;

let firebaseConfig: FirebaseOptions | null = null;
const firebaseWebAppConfigString = process.env.FIREBASE_WEBAPP_CONFIG;

if (firebaseWebAppConfigString) {
  try {
    console.log('[Firebase Server Init] Attempting to use FIREBASE_WEBAPP_CONFIG environment variable.');
    firebaseConfig = JSON.parse(firebaseWebAppConfigString);
  } catch (error) {
    console.error("--------------------------------------------------------------------")
    console.error("[Firebase Server Init] Failed to parse FIREBASE_WEBAPP_CONFIG:", error);
    console.error("Ensure FIREBASE_WEBAPP_CONFIG is a valid JSON string.");
    console.error("Falling back to NEXT_PUBLIC_ variables if available.");
    console.error("--------------------------------------------------------------------")
    firebaseConfig = null; // Ensure it's null if parsing failed
  }
}

if (!firebaseConfig) {
  console.log('[Firebase Server Init] FIREBASE_WEBAPP_CONFIG not found or parsing failed. Attempting to use NEXT_PUBLIC_ environment variables for server-side client SDK.');
  const nextPublicConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    // Note: databaseId for getFirestore() is handled separately below
  };

  if (nextPublicConfig.apiKey && nextPublicConfig.projectId) {
    firebaseConfig = nextPublicConfig;
    console.log('[Firebase Server Init] Successfully constructed config from NEXT_PUBLIC_ variables.');
  } else {
    console.error("--------------------------------------------------------------------")
    console.error("[Firebase Server Init] CRITICAL: Firebase configuration is missing for Server Actions.");
    console.error("Neither FIREBASE_WEBAPP_CONFIG nor all required NEXT_PUBLIC_FIREBASE_ variables are set/valid.");
    console.error("Server-side Firebase client SDK operations will likely fail.");
    console.error("Please check your environment variables in apphosting.yaml and/or .env.local.");
    console.error("--------------------------------------------------------------------")
  }
}

const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    console.log('[Firebase Server Init] Initializing new Firebase app for server actions.');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('[Firebase Server Init] Using existing Firebase app for server actions.');
    app = getApp(); // Use the default app if already initialized
  }
  try {
    db = databaseId && databaseId !== "(default)" && databaseId.trim() !== ""
      ? getFirestore(app, databaseId)
      : getFirestore(app);
    if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
      console.log(`[Firebase Server Init] Firestore instance obtained for server actions, Database ID: "${databaseId}".`);
    } else {
      console.log('[Firebase Server Init] Firestore instance obtained for server actions, Database ID: (default).');
    }
  } catch (e) {
     console.error("[Firebase Server Init] Error getting Firestore instance:", e);
     // @ts-ignore 
     db = {} as ReturnType<typeof getFirestore>; // Assign dummy to prevent hard crashes on import
  }
} else {
  console.warn("[Firebase Server Init] Firestore 'db' instance for server actions is not properly initialized due to missing/incomplete Firebase config. Firestore operations in Server Actions will fail.");
  // @ts-ignore 
  db = {} as ReturnType<typeof getFirestore>; // Assign dummy object
}

export { db };
