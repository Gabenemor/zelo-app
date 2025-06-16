
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let app;
let db: ReturnType<typeof getFirestore>;
let firebaseConfig: FirebaseOptions | null = null;

// Standardized variable names for clarity
const nextPublicConfigString = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
const serverOnlyConfigString = process.env.FIREBASE_WEBAPP_CONFIG; // For potential server-only, non-public configs

if (nextPublicConfigString) {
  try {
    console.log('[Firebase Server Init] Attempting to parse NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG.');
    const parsedConfig = JSON.parse(nextPublicConfigString);
    if (parsedConfig.apiKey && parsedConfig.projectId) {
      firebaseConfig = parsedConfig;
      console.log('[Firebase Server Init] Successfully parsed and validated NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG.');
    } else {
      console.warn('[Firebase Server Init] Parsed NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is incomplete (missing apiKey or projectId).');
      firebaseConfig = null;
    }
  } catch (error) {
    console.error("[Firebase Server Init] Failed to parse NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG JSON string:", error);
    firebaseConfig = null;
  }
}

// Fallback to a server-only config string if the public one wasn't valid or found
if (!firebaseConfig && serverOnlyConfigString) {
  console.log('[Firebase Server Init] NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG not used. Attempting to parse FIREBASE_WEBAPP_CONFIG (server-only).');
  try {
    const parsedConfig = JSON.parse(serverOnlyConfigString);
    if (parsedConfig.apiKey && parsedConfig.projectId) {
      firebaseConfig = parsedConfig;
      console.log('[Firebase Server Init] Successfully parsed and validated FIREBASE_WEBAPP_CONFIG.');
    } else {
      console.warn('[Firebase Server Init] Parsed FIREBASE_WEBAPP_CONFIG is incomplete.');
      firebaseConfig = null;
    }
  } catch (error) {
    console.error("[Firebase Server Init] Failed to parse FIREBASE_WEBAPP_CONFIG JSON string:", error);
    firebaseConfig = null;
  }
}

// Fallback to individual NEXT_PUBLIC_ variables if no complete config string was successfully parsed
if (!firebaseConfig) {
  console.log('[Firebase Server Init] No complete Firebase Web App Config JSON string found or parsed. Attempting to construct from individual NEXT_PUBLIC_ environment variables.');
  const individualConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (individualConfig.apiKey && individualConfig.projectId) {
    firebaseConfig = individualConfig;
    console.log('[Firebase Server Init] Successfully constructed config from individual NEXT_PUBLIC_ variables.');
  }
}

// Final check and initialization
if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
  const appName = "firebase-server-init-app"; // Give a unique name
  if (!getApps().find(existingApp => existingApp.name === appName)) {
    console.log(`[Firebase Server Init] Initializing new Firebase app "${appName}" for server actions.`);
    app = initializeApp(firebaseConfig, appName);
  } else {
    console.log(`[Firebase Server Init] Using existing Firebase app "${appName}" for server actions.`);
    app = getApp(appName);
  }

  const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
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
  console.error("--------------------------------------------------------------------");
  console.error("[Firebase Server Init] CRITICAL: Firebase configuration is missing or incomplete for Server Actions.");
  console.error("Ensure NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is set correctly in apphosting.yaml AND contains a valid JSON string with apiKey and projectId,");
  console.error("OR ensure all individual NEXT_PUBLIC_FIREBASE_... variables (API_KEY, PROJECT_ID, etc.) are defined if not using the JSON string method.");
  console.error("Server-side Firebase client SDK operations will likely fail.");
  console.error("--------------------------------------------------------------------");
  // @ts-ignore
  db = {} as ReturnType<typeof getFirestore>; // Assign dummy object
}

export { db };
