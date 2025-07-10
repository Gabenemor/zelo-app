
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

let db: Firestore;

try {
  const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
  if (!firebaseConfigString) {
    throw new Error("CRITICAL: NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is not defined in the environment.");
  }
  
  const firebaseConfig: FirebaseOptions = JSON.parse(firebaseConfigString);
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("CRITICAL: Parsed Firebase config is missing apiKey or projectId.");
  }

  const appName = "firebase-server-init-app";
  let app = getApps().find(existingApp => existingApp.name === appName);
  
  if (!app) {
    console.log(`[Firebase Server Init] Initializing new Firebase app "${appName}" for server actions.`);
    app = initializeApp(firebaseConfig, appName);
  } else {
    console.log(`[Firebase Server Init] Using existing Firebase app "${appName}" for server actions.`);
  }

  const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
  
  // Use initializeFirestore which is more robust for specific DB IDs.
  // getFirestore() can sometimes be ambiguous about which app/db it's attached to if not handled carefully.
  db = initializeFirestore(app, {
    databaseId: (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") ? databaseId : undefined,
  });

  if (databaseId && databaseId !== "(default)" && databaseId.trim() !== "") {
    console.log(`[Firebase Server Init] Firestore instance obtained for server actions, Database ID: "${databaseId}".`);
  } else {
    console.log('[Firebase Server Init] Firestore instance obtained for server actions, Database ID: (default).');
  }

} catch (error: any) {
  console.error("--------------------------------------------------------------------");
  console.error("[Firebase Server Init] CRITICAL: Failed to initialize Firebase for Server Actions.");
  console.error("Error:", error.message);
  console.error("Ensure NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG is set correctly in apphosting.yaml AND contains a valid JSON string.");
  console.error("--------------------------------------------------------------------");
  
  // Assign a dummy object to prevent hard crashes on import, though operations will fail.
  db = {} as Firestore;
}

export { db };
