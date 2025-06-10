
'use server';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let app;
let db: ReturnType<typeof getFirestore>;

const firebaseConfigString = process.env.FIREBASE_WEBAPP_CONFIG;

if (!firebaseConfigString) {
  console.error("--------------------------------------------------------------------")
  console.error("Firebase server-side initialization error:");
  console.error("FIREBASE_WEBAPP_CONFIG environment variable is not set.");
  console.error("Please set this variable in your apphosting.yaml or .env.local file.");
  console.error("It should be the JSON string of your Firebase web app's config.");
  console.error("App will likely fail to connect to Firebase services on the server.");
  console.error("--------------------------------------------------------------------")
  // To prevent hard crash during build if env var is missing, but functionality will be broken.
  // In a real scenario, you might throw an error or handle this more gracefully.
}


if (firebaseConfigString) {
  try {
    const firebaseConfig: FirebaseOptions = JSON.parse(firebaseConfigString);
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
  } catch (error) {
    console.error("--------------------------------------------------------------------")
    console.error("Firebase server-side initialization error:");
    console.error("Failed to parse FIREBASE_WEBAPP_CONFIG or initialize Firebase app:", error);
    console.error("Make sure FIREBASE_WEBAPP_CONFIG is a valid JSON string.");
    console.error("--------------------------------------------------------------------")
  }
} else {
  // Provide dummy instances if config is missing to avoid crashing server actions that import 'db'
  // but log that they are not functional.
  console.warn("Firestore 'db' instance is not properly initialized due to missing FIREBASE_WEBAPP_CONFIG. Firestore operations will fail.");
  // @ts-ignore // Assigning a dummy object for type safety in dependent files
  db = {} as ReturnType<typeof getFirestore>; 
}


export { db };
