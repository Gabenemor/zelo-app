
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

    const userDocData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName,
      role,
      status: 'active',
      emailVerified: firebaseUser.emailVerified, // Will be false initially
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    console.log('[Auth] Preparing to set Firestore user document:', userDocData);
    await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
    console.log('[Auth] Firestore user document created/updated in /users.');

    const commonProfileData = {
      userId: firebaseUser.uid,
      fullName: fullName, // Add fullName to profile as well
      contactEmail: firebaseUser.email, // Pre-fill contact email
      onboardingCompleted: false,
      profileSetupCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (role === 'artisan') {
      const artisanProfileData = {
        ...commonProfileData,
        servicesOffered: [],
      };
      console.log('[Auth] Preparing to set Firestore artisanProfile document:', artisanProfileData);
      await setDoc(doc(db, 'artisanProfiles', firebaseUser.uid), artisanProfileData);
      console.log('[Auth] Firestore artisanProfile document created in /artisanProfiles.');
    } else if (role === 'client') {
      const clientProfileData = {
        ...commonProfileData,
        servicesLookingFor: [],
      };
      console.log('[Auth] Preparing to set Firestore clientProfile document:', clientProfileData);
      await setDoc(doc(db, 'clientProfiles', firebaseUser.uid), clientProfileData);
      console.log('[Auth] Firestore clientProfile document created in /clientProfiles.');
    }

    const registeredAuthUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName, // Should be fullName now
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

    if (!firebaseUser.emailVerified) {
      console.warn('[Auth] Email not verified for user:', firebaseUser.uid);
      // Optionally sign them out if you strictly enforce verification before login to dashboard
      // await signOut(auth);
      // console.log('[Auth] User signed out due to unverified email.');
      // return { error: "Please verify your email address before logging in. Check your inbox." };
    }

    console.log('[Auth] Fetching user document from Firestore /users/', firebaseUser.uid);
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      console.error('[Auth] User document not found in Firestore for UID:', firebaseUser.uid);
      await signOut(auth); // Sign out the user as their profile is incomplete/missing
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
    }
    return {
      error: errorMessage
    };
  } // Added closing brace for the catch block
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

