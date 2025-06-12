
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserRole } from '@/types';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  emailVerified: boolean;
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<{ user?: AuthUser; error?: string }> {
  console.log('[Auth] Attempting to register user:', { email, fullName, role });
  try {
    console.log('[Auth] Calling createUserWithEmailAndPassword...');
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('[Auth] User created in Firebase Auth, UID:', firebaseUser.uid);

    console.log('[Auth] Attempting to send email verification...');
    await sendEmailVerification(firebaseUser);
    console.log('[Auth] Email verification sent.');

    console.log('[Auth] Updating Firebase Auth profile with displayName:', fullName);
    await updateProfile(firebaseUser, { displayName: fullName });
    console.log('[Auth] Firebase Auth profile updated.');

    // Simplified data for testing
    const userDocDataMinimal = {
      uid: firebaseUser.uid,
      role,
      email: firebaseUser.email, // Keep email for reference
      fullName, // Keep fullName for reference
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active', // Add status as it's in the type
      emailVerified: firebaseUser.emailVerified, // Add emailVerified
    };
    console.log('[Auth] Preparing to set Firestore user document (minimal):', userDocDataMinimal);
    await setDoc(doc(db, 'users', firebaseUser.uid), userDocDataMinimal);
    console.log('[Auth] Firestore user document (minimal) created/updated in /users.');

    const commonProfileDataMinimal = {
      userId: firebaseUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Add other essential non-optional fields if your type definition for profiles requires them
      // For example, if fullName and contactEmail are structurally vital for ClientProfile/ArtisanProfile:
      fullName: fullName,
      contactEmail: firebaseUser.email,
      onboardingCompleted: false,
      profileSetupCompleted: false,
    };

    if (role === 'artisan') {
      const artisanProfileDataMinimal = {
        ...commonProfileDataMinimal,
        servicesOffered: [], // Minimal required field
      };
      console.log('[Auth] Preparing to set Firestore artisanProfile document (minimal):', artisanProfileDataMinimal);
      await setDoc(doc(db, 'artisanProfiles', firebaseUser.uid), artisanProfileDataMinimal);
      console.log('[Auth] Firestore artisanProfile document (minimal) created in /artisanProfiles.');
    } else if (role === 'client') {
      const clientProfileDataMinimal = {
        ...commonProfileDataMinimal,
        servicesLookingFor: [], // Minimal required field
      };
      console.log('[Auth] Preparing to set Firestore clientProfile document (minimal):', clientProfileDataMinimal);
      await setDoc(doc(db, 'clientProfiles', firebaseUser.uid), clientProfileDataMinimal);
      console.log('[Auth] Firestore clientProfile document (minimal) created in /clientProfiles.');
    }

    const registeredAuthUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role,
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Registration successful. Returning user:', registeredAuthUser);
    return { user: registeredAuthUser };

  } catch (error: any) {
    console.error("[Auth] Registration error in @/lib/auth.ts:", error.code, error.message, error);
    return {
      error: error.message || "An unknown error occurred during registration."
    };
  }
}

export async function loginUser(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
  console.log('[Auth] Attempting to login user:', { email });
  try {
    console.log('[Auth] Calling signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('[Auth] User signed in to Firebase Auth, UID:', firebaseUser.uid);

    // if (!firebaseUser.emailVerified) {
    //   console.warn('[Auth] Email not verified for user:', firebaseUser.uid);
    //   // await signOut(auth);
    //   // console.log('[Auth] User signed out due to unverified email.');
    //   // return { error: "Please verify your email address before logging in. Check your inbox." };
    // }

    console.log('[Auth] Fetching user document from Firestore /users/', firebaseUser.uid);
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      console.error('[Auth] User document not found in Firestore for UID:', firebaseUser.uid);
      await signOut(auth); 
      console.log('[Auth] User signed out due to missing Firestore user document.');
      return { error: 'User data not found. Please contact support or try registering again.' };
    }
    
    const userData = userDoc.data();
    console.log('[Auth] Firestore user document data retrieved:', userData);

    const loggedInAuthUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userData.role as UserRole,
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Login successful. Returning user:', loggedInAuthUser);
    return { user: loggedInAuthUser };

  } catch (error: any) { // Added opening brace for the catch block
    console.error("[Auth] Login error in @/lib/auth.ts:", error.code, error.message, error);
    // Map common Firebase auth errors to more user-friendly messages if desired
    let errorMessage = error.message || "An unknown error occurred during login.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'firebase-auth/invalid-credential') {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
    } else if (error.code === 'unavailable') { 
      errorMessage = "Could not connect to the database. Please check your internet connection and try again.";
    }
    return {
      error: errorMessage
    };
  }
}

export async function logoutUser(): Promise<void> {
  console.log('[Auth] Attempting to logout user...');
  try {
    await signOut(auth);
    console.log('[Auth] User logged out successfully.');
  } catch (error: any) {
    console.error("[Auth] Logout error:", error.code, error.message);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  console.log('[Auth] Attempting to get current Firebase Auth user state...');
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    console.log('[Auth] No user currently signed in (auth.currentUser is null).');
    return null;
  }
  console.log('[Auth] Firebase Auth user found, UID:', firebaseUser.uid, 'Email Verified:', firebaseUser.emailVerified);

  try {
    console.log('[Auth] Fetching user document from Firestore for current user /users/', firebaseUser.uid);
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      console.warn(`[Auth] User document not found for UID: ${firebaseUser.uid} in getCurrentUser.`);
      return null; 
    }
    const userData = userDoc.data();
    console.log('[Auth] Firestore user document data for current user retrieved:', userData);

    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userData.role as UserRole,
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Current user successfully retrieved and mapped:', authUser);
    return authUser;
  } catch (error: any) {
    console.error("[Auth] Error fetching current user data from Firestore:", error.code, error.message, error);
    return null;
  }
}
