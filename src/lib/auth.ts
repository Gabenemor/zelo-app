
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
  sendEmailVerification,
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
      fullName: firebaseUser.displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      emailVerified: firebaseUser.emailVerified,
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
      onboardingCompleted: false,
      profileSetupCompleted: false,
    };

    if (role === 'artisan') {
      const artisanProfileData = {
        ...commonProfileData,
        servicesOffered: [], // Artisans need to select services in onboarding
      };
      console.log('[Auth] Preparing to set Firestore artisanProfile document:', artisanProfileData);
      await setDoc(doc(db, 'artisanProfiles', firebaseUser.uid), artisanProfileData);
      console.log('[Auth] Firestore artisanProfile document created in /artisanProfiles.');
    } else if (role === 'client') {
      const clientProfileData = {
        ...commonProfileData,
        servicesLookingFor: [], // Clients can specify preferences in onboarding
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
      role: userData.role as UserRole,
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Login successful. Returning user:', loggedInAuthUser);
    return { user: loggedInAuthUser };

  } catch (error: any) { 
    console.error("[Auth] Login error in @/lib/auth.ts:", error.code, error.message, error);
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

export async function signInWithGoogle(): Promise<{ user?: AuthUser; error?: string; isNewUser?: boolean; requiresOnboarding?: boolean }> {
  console.log('[Auth] Attempting Sign in with Google...');
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    console.log('[Auth] Google Sign-In successful, UID:', firebaseUser.uid, 'Email Verified:', firebaseUser.emailVerified);

    const additionalInfo = getAdditionalUserInfo(result);
    const isNewUser = additionalInfo?.isNewUser || false;
    console.log('[Auth] Is new Google user:', isNewUser);

    let userRole: UserRole;
    let profileNeedsOnboarding = false;

    if (isNewUser) {
      console.log('[Auth] New user via Google Sign-In. Creating Firestore documents.');
      userRole = 'client'; // Default new Google Sign-In users to 'client'.
      profileNeedsOnboarding = true; // New users always need onboarding

      const userDocData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
        role: userRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        emailVerified: firebaseUser.emailVerified,
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
      console.log('[Auth] Firestore user document created for Google user in /users.');

      const clientProfileData = {
        userId: firebaseUser.uid,
        fullName: firebaseUser.displayName,
        contactEmail: firebaseUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onboardingCompleted: false,
        profileSetupCompleted: false,
        servicesLookingFor: [],
      };
      await setDoc(doc(db, 'clientProfiles', firebaseUser.uid), clientProfileData);
      console.log('[Auth] Firestore clientProfile document created for Google user in /clientProfiles.');

    } else {
      console.log('[Auth] Existing user via Google Sign-In. Fetching Firestore document for role.');
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // This is an edge case: user exists in Firebase Auth but not in our 'users' collection.
        // This might happen if Firestore write failed during a previous partial registration.
        // We should create the user document and profile, defaulting to 'client'.
        console.warn('[Auth] User exists in Auth but not in Firestore users collection. Creating document. UID:', firebaseUser.uid);
        userRole = 'client'; // Default to client
        profileNeedsOnboarding = true; // Treat as needing onboarding

        const userDocData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          role: userRole,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          emailVerified: firebaseUser.emailVerified,
        };
        await setDoc(userDocRef, userDocData);
        console.log('[Auth] Firestore user document (re)created for existing Google user.');

        const clientProfileRef = doc(db, 'clientProfiles', firebaseUser.uid);
        const clientProfileSnap = await getDoc(clientProfileRef);
        if (!clientProfileSnap.exists()) {
          const clientProfileData = {
            userId: firebaseUser.uid,
            fullName: firebaseUser.displayName,
            contactEmail: firebaseUser.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            onboardingCompleted: false,
            profileSetupCompleted: false,
            servicesLookingFor: [],
          };
          await setDoc(clientProfileRef, clientProfileData);
          console.log('[Auth] Firestore clientProfile document (re)created for existing Google user.');
        } else {
            // Client profile exists, check if onboarding was completed
            if(!clientProfileSnap.data()?.profileSetupCompleted) {
                 profileNeedsOnboarding = true;
            }
        }
      } else {
        const userData = userDocSnap.data();
        userRole = userData.role as UserRole;
        console.log('[Auth] Existing Google user, Firestore role from /users:', userRole);
        
        // Check if profile setup was completed for this role
        if (userRole === 'client') {
            const clientProfileDoc = await getDoc(doc(db, 'clientProfiles', firebaseUser.uid));
            if (!clientProfileDoc.exists() || !clientProfileDoc.data()?.profileSetupCompleted) {
                profileNeedsOnboarding = true; // Needs to complete profile setup
            }
        } else if (userRole === 'artisan') {
            const artisanProfileDoc = await getDoc(doc(db, 'artisanProfiles', firebaseUser.uid));
             if (!artisanProfileDoc.exists() || !artisanProfileDoc.data()?.profileSetupCompleted) {
                profileNeedsOnboarding = true; // Needs to complete profile setup
            }
        }
        console.log(`[Auth] Existing user. Role: ${userRole}. Needs onboarding/profile setup: ${profileNeedsOnboarding}`);
      }
    }

    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userRole,
      emailVerified: firebaseUser.emailVerified,
    };
    console.log('[Auth] Google Sign-In process complete. Returning:', { user: authUser, isNewUser, requiresOnboarding: profileNeedsOnboarding });
    return { user: authUser, isNewUser, requiresOnboarding: profileNeedsOnboarding };

  } catch (error: any) {
    console.error("[Auth] Google Sign-In Error:", error.code, error.message, error);
    let errorMessage = "Could not sign in with Google. Please try again.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign-in popup closed before completion.";
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with this email address using a different sign-in method (e.g., email/password). Please sign in using that method.";
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
