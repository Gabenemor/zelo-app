
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential
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
): Promise<{ user: AuthUser; error?: string }> {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      fullName,
      role,
      status: 'active',
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const commonProfileData = {
      userId: user.uid,
      onboardingCompleted: false,
      profileSetupCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (role === 'artisan') {
      await setDoc(doc(db, 'artisanProfiles', user.uid), {
        ...commonProfileData,
        servicesOffered: [], // Initialize with empty array
      });
    } else if (role === 'client') {
      await setDoc(doc(db, 'clientProfiles', user.uid), {
        ...commonProfileData,
        servicesLookingFor: [], // Initialize with empty array
      });
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error: any) {
    console.error("Registration error in @/lib/auth.ts:", error);
    return {
      user: {} as AuthUser, // Return empty user object on error
      error: error.message || "An unknown error occurred during registration."
    };
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (!userData) {
      // This case should ideally not happen if registration ensures user doc creation
      await signOut(auth); // Sign out the user as their profile is incomplete
      throw new Error('User data not found in Firestore. Please contact support.');
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role as UserRole,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error: any) {
    console.error("Login error in @/lib/auth.ts:", error);
    return {
      user: {} as AuthUser,
      error: error.message || "An unknown error occurred during login."
    };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      console.warn(`User document not found for UID: ${user.uid} in getCurrentUser.`);
      return null; // Or handle as an error / incomplete profile
    }
    const userData = userDoc.data();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: userData.role as UserRole,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("Error fetching current user data from Firestore:", error);
    return null;
  }
}
