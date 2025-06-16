
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser, // Renamed to avoid conflict with our User type
  UserCredential,
  sendEmailVerification as firebaseSendEmailVerification, // Renamed
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
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

// This interface helps define the varied return structure of signInWithGoogle
export interface SignInWithGoogleResult {
  user?: AuthUser; // Fully formed user if role is known & onboarding status determined
  partialUser?: { // For new users needing role selection, before Firestore docs exist
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
  };
  error?: string;
  isNewUser?: boolean; // Was this a new Firebase Auth account?
  requiresRoleSelection?: boolean; // True if new user needs to select a role on our platform
  requiresOnboarding?: boolean; // True if user (new or existing) needs to complete profile/onboarding for their role
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
    await firebaseSendEmailVerification(firebaseUser);
    console.log('[Auth] Email verification sent.');

    console.log('[Auth] Updating Firebase Auth profile with displayName:', fullName);
    await updateProfile(firebaseUser, { displayName: fullName });
    console.log('[Auth] Firebase Auth profile updated.');

    const userDocData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      emailVerified: firebaseUser.emailVerified, // Store initial verification status
    };
    console.log('[Auth] Preparing to set Firestore user document:', userDocData);
    await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
    console.log('[Auth] Firestore user document created/updated in /users.');

    const commonProfileData = {
      userId: firebaseUser.uid,
      fullName: firebaseUser.displayName,
      contactEmail: firebaseUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: false, // Will be set true after onboarding steps
      profileSetupCompleted: false, // Will be set true after specific profile setup step
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
      role: userData.role as UserRole, // Assuming role is stored in Firestore
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Login successful. Returning user:', loggedInAuthUser);
    return { user: loggedInAuthUser };

  } catch (error: any) { 
    console.error("[Auth] Login error in @/lib/auth.ts:", error.code, error.message, error);
    let errorMessage = error.message || "An unknown error occurred during login.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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

export async function signInWithGoogle(): Promise<SignInWithGoogleResult> {
  console.log('[Auth] Attempting Sign in with Google...');
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const additionalInfo = getAdditionalUserInfo(result);
    const isNewAuthUser = additionalInfo?.isNewUser || false; // Is it a new Firebase Auth user?
    console.log('[Auth] Google Sign-In successful, UID:', firebaseUser.uid, 'Is new Auth user:', isNewAuthUser);

    const partialUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
    };

    // Check if user exists in our /users collection in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // User does not exist in our /users collection. This means they need to select a role.
      console.log('[Auth] New user for Zelo platform (no record in /users). Requires role selection.');
      return { partialUser, isNewUser: true, requiresRoleSelection: true, requiresOnboarding: true };
    } else {
      // User exists in /users. They have a role. Check if they need onboarding for that role.
      const userData = userDocSnap.data();
      const userRole = userData.role as UserRole;
      console.log('[Auth] Existing Zelo user. Role:', userRole);

      let profileSetupCompleted = false;
      if (userRole === 'client') {
        const clientProfileDoc = await getDoc(doc(db, 'clientProfiles', firebaseUser.uid));
        profileSetupCompleted = clientProfileDoc.exists() && clientProfileDoc.data()?.profileSetupCompleted === true;
      } else if (userRole === 'artisan') {
        const artisanProfileDoc = await getDoc(doc(db, 'artisanProfiles', firebaseUser.uid));
        profileSetupCompleted = artisanProfileDoc.exists() && artisanProfileDoc.data()?.profileSetupCompleted === true;
      }
      
      const authUser: AuthUser = { ...partialUser, role: userRole };
      const needsOnboarding = !profileSetupCompleted;
      console.log(`[Auth] Existing user. Profile setup completed: ${profileSetupCompleted}. Needs onboarding: ${needsOnboarding}`);
      return { user: authUser, isNewUser: false, requiresRoleSelection: false, requiresOnboarding: needsOnboarding };
    }

  } catch (error: any) {
    console.error("[Auth] Google Sign-In Error:", error.code, error.message, error);
    let errorMessage = "Could not sign in with Google. Please try again.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign-in popup closed before completion.";
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with this email using a different sign-in method. Please sign in using that method.";
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = "Sign-in cancelled. Multiple popups were opened."
    }
    return { error: errorMessage };
  }
}


export async function logoutUser(): Promise<void> {
  console.log('[Auth] Attempting to logout user...');
  try {
    await signOut(auth);
    console.log('[Auth] User logged out successfully.');
  } catch (error: any)
{
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
      // This could happen if Firestore creation failed post-auth or if user was deleted from Firestore but not Auth
      return null; 
    }
    const userData = userDoc.data();
    console.log('[Auth] Firestore user document data for current user retrieved:', userData);

    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userData.role as UserRole, // Role MUST exist on user document
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Current user successfully retrieved and mapped:', authUser);
    return authUser;
  } catch (error: any) {
    console.error("[Auth] Error fetching current user data from Firestore:", error.code, error.message, error);
    return null;
  }
}

export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await firebaseSendEmailVerification(currentUser);
      console.log('[Auth] Verification email resent to:', currentUser.email);
      return { success: true };
    } catch (error: any) {
      console.error("[Auth] Error resending verification email:", error);
      // Provide more specific error messages if possible
      let message = "Failed to resend verification email. Please try again later.";
      if (error.code === 'auth/too-many-requests') {
        message = "Too many requests. Please try again later to resend the verification email.";
      }
      return { success: false, error: message };
    }
  } else {
    console.warn('[Auth] Attempted to resend verification email, but no user is signed in.');
    return { success: false, error: "No user is currently signed in." };
  }
}


// Note: The initial `src/lib/firebase-server-init.ts` logic has been moved into the top of `src/actions/onboarding-actions.ts`
// and potentially will be needed in `src/actions/auth-actions.ts` if not already implicitly handled by client-side `db` import.
// Server-side initialization of Firebase Admin SDK is different and not used here for client-callable actions.
// This file `auth.ts` relies on client-side `auth` and `db` from `./firebase`.

