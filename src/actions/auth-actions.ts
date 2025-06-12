
'use server';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-server-init'; // Use server-initialized db
import type { UserRole } from '@/types';

interface CompleteGoogleSignInData {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
}

export async function completeGoogleSignInWithRole(
  data: CompleteGoogleSignInData
): Promise<{ success: boolean; role?: UserRole; error?: string }> {
  const { uid, email, displayName, role } = data;

  if (!uid || !role) {
    return { success: false, error: "Missing user ID or role." };
  }

  try {
    console.log(`[AuthAction] Completing Google Sign-In for UID: ${uid}, Role: ${role}`);

    // Create user document in /users collection
    const userDocData = {
      uid,
      email,
      fullName: displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      emailVerified: true, // Google users are assumed to have verified emails
    };
    await setDoc(doc(db, 'users', uid), userDocData);
    console.log(`[AuthAction] Firestore user document created in /users for ${uid}.`);

    // Create corresponding profile document
    const commonProfileData = {
      userId: uid,
      fullName: displayName,
      contactEmail: email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: false, 
      profileSetupCompleted: false,
    };

    if (role === 'artisan') {
      const artisanProfileData = {
        ...commonProfileData,
        servicesOffered: [], 
      };
      await setDoc(doc(db, 'artisanProfiles', uid), artisanProfileData);
      console.log(`[AuthAction] Firestore artisanProfile document created for ${uid}.`);
    } else if (role === 'client') {
      const clientProfileData = {
        ...commonProfileData,
        servicesLookingFor: [],
      };
      await setDoc(doc(db, 'clientProfiles', uid), clientProfileData);
      console.log(`[AuthAction] Firestore clientProfile document created for ${uid}.`);
    }

    return { success: true, role };

  } catch (error: any) {
    console.error("[AuthAction] Error completing Google Sign-In with role:", error);
    return { success: false, error: error.message || "Failed to complete registration." };
  }
}
