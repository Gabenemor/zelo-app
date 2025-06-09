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

    // Update the user's display name
    await updateProfile(user, { displayName: fullName });

    // Create user document in Firestore
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

    // Create role-specific profile document
    if (role === 'artisan') {
      await setDoc(doc(db, 'artisanProfiles', user.uid), {
        userId: user.uid,
        servicesOffered: [],
        onboardingCompleted: false,
        profileSetupCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (role === 'client') {
      await setDoc(doc(db, 'clientProfiles', user.uid), {
        userId: user.uid,
        servicesLookingFor: [],
        onboardingCompleted: false,
        profileSetupCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
    return {
      user: {} as AuthUser,
      error: error.message
    };
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User data not found');
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error: any) {
    return {
      user: {} as AuthUser,
      error: error.message
    };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  if (!userData) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: userData.role,
    emailVerified: user.emailVerified,
  };
}