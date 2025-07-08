
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  addDoc,
  QueryConstraint, // Import QueryConstraint
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  Unsubscribe,
  writeBatch,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  ArtisanProfile,
  ClientProfile,
  ServiceRequest,
  ArtisanProposal,
  EscrowTransaction,
  WithdrawalAccount,
  NotificationItem,
  DisputeItem
} from '@/types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date(); 
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  const parsedDate = new Date(timestamp);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  return new Date(); 
};

// User operations
export async function createUserDoc(userData: Omit<User, 'createdAt' | 'updatedAt' | 'id'> & { id: string }): Promise<void> {
  await setDoc(doc(db, 'users', userData.id), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return {
    ...data,
    id: userDoc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as User;
}

export async function getAllUsers(options?: { limit?: number }): Promise<User[]> {
  const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (options?.limit) {
    queryConstraints.push(limit(options.limit));
  }
  const q = query(collection(db, 'users'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as User[];
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Artisan Profile operations
export async function createArtisanProfile(profile: Omit<ArtisanProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'artisanProfiles', profile.userId), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getArtisanProfile(userId: string): Promise<ArtisanProfile | null> {
  const profileDoc = await getDoc(doc(db, 'artisanProfiles', userId));
  if (!profileDoc.exists()) return null;
  
  const data = profileDoc.data();
  return {
    ...data,
    userId: profileDoc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as ArtisanProfile;
}

export async function updateArtisanProfile(userId: string, updates: Partial<ArtisanProfile>): Promise<void> {
  await updateDoc(doc(db, 'artisanProfiles', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getArtisans(filters?: {
  services?: string[];
  location?: string;
  limit?: number;
}): Promise<ArtisanProfile[]> {
  const queryConstraints: QueryConstraint[] = [];
  if (filters?.services && filters.services.length > 0) {
    queryConstraints.push(where('servicesOffered', 'array-contains-any', filters.services));
  }
  if (filters?.location) {
    queryConstraints.push(where('location', '>=', filters.location), where('location', '<=', filters.location + '\uf8ff'));
  }
  if (filters?.limit) {
    queryConstraints.push(limit(filters.limit));
  }
  // Add a default order by if no other order is specified, e.g., by username or creation date
  if (!queryConstraints.some(c => c.type === 'orderBy')) {
    queryConstraints.push(orderBy('username', 'asc')); // Example default order
  }
  
  const q = query(collection(db, 'artisanProfiles'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    userId: doc.id,
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as ArtisanProfile[];
}

// Client Profile operations
export async function createClientProfile(profile: Omit<ClientProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'clientProfiles', profile.userId), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getClientProfile(userId: string): Promise<ClientProfile | null> {
  const profileDoc = await getDoc(doc(db, 'clientProfiles', userId));
  if (!profileDoc.exists()) return null;
  
  const data = profileDoc.data();
  return {
    ...data,
    userId: profileDoc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as ClientProfile;
}

export async function updateClientProfile(userId: string, updates: Partial<ClientProfile>): Promise<void> {
  await updateDoc(doc(db, 'clientProfiles', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Service Request operations
export async function createServiceRequest(request: Omit<ServiceRequest, 'id' | 'postedAt' | 'status'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'serviceRequests'), {
    ...request,
    postedAt: serverTimestamp(),
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getServiceRequest(requestId: string): Promise<ServiceRequest | null> {
  const requestDoc = await getDoc(doc(db, 'serviceRequests', requestId));
  if (!requestDoc.exists()) return null;
  
  const data = requestDoc.data();
  return {
    ...data,
    id: requestDoc.id,
    postedAt: convertTimestamp(data.postedAt),
    createdAt: convertTimestamp(data.createdAt), // Ensure these are converted
    updatedAt: convertTimestamp(data.updatedAt),
  } as ServiceRequest;
}

export async function updateServiceRequest(requestId: string, updates: Partial<ServiceRequest>): Promise<void> {
  await updateDoc(doc(db, 'serviceRequests', requestId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getServiceRequests(filters?: {
  clientId?: string;
  status?: ServiceRequest['status'] | ServiceRequest['status'][];
  category?: string;
  artisanId?: string;
  limit?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<ServiceRequest[]> {
  const queryConstraints: QueryConstraint[] = [];
  
  if (filters?.orderByField) {
    queryConstraints.push(orderBy(filters.orderByField, filters.orderDirection || 'desc'));
  } else if (!filters?.clientId && !filters?.artisanId) {
    // Only apply the default sort order if not filtering by a specific user.
    // This avoids the composite index requirement for user-specific queries if the index is not deployed.
    // The client-side code will handle sorting for these cases.
    queryConstraints.push(orderBy('postedAt', 'desc'));
  }

  if (filters?.clientId) {
    queryConstraints.push(where('clientId', '==', filters.clientId));
  }
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      if (filters.status.length > 0) {
        queryConstraints.push(where('status', 'in', filters.status));
      } else {
        return [];
      }
    } else {
      queryConstraints.push(where('status', '==', filters.status));
    }
  }
  if (filters?.category) {
    queryConstraints.push(where('category', '==', filters.category));
  }
  if (filters?.artisanId) {
    queryConstraints.push(where('assignedArtisanId', '==', filters.artisanId));
  }
  if (filters?.limit) {
    queryConstraints.push(limit(filters.limit));
  }
  
  const q = query(collection(db, 'serviceRequests'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    postedAt: convertTimestamp(doc.data().postedAt),
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as ServiceRequest[];
}

// Proposal operations
export async function createProposal(proposal: Omit<ArtisanProposal, 'id' | 'submittedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'proposals'), {
    ...proposal,
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProposal(proposalId: string): Promise<ArtisanProposal | null> {
  const proposalDoc = await getDoc(doc(db, 'proposals', proposalId));
  if (!proposalDoc.exists()) return null;
  
  const data = proposalDoc.data();
  return {
    ...data,
    id: proposalDoc.id,
    submittedAt: convertTimestamp(data.submittedAt),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as ArtisanProposal;
}

export async function updateProposal(proposalId: string, updates: Partial<ArtisanProposal>): Promise<void> {
  await updateDoc(doc(db, 'proposals', proposalId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getProposals(filters: {
  serviceRequestId?: string;
  artisanId?: string;
  status?: ArtisanProposal['status'];
  limit?: number;
}): Promise<ArtisanProposal[]> {
  const queryConstraints: QueryConstraint[] = [orderBy('submittedAt', 'desc')];
  if (filters.serviceRequestId) {
    queryConstraints.push(where('serviceRequestId', '==', filters.serviceRequestId));
  }
  if (filters.artisanId) {
    queryConstraints.push(where('artisanId', '==', filters.artisanId));
  }
  if (filters.status) {
    queryConstraints.push(where('status', '==', filters.status));
  }
  if (filters.limit) {
    queryConstraints.push(limit(filters.limit));
  }

  const q = query(collection(db, 'proposals'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    submittedAt: convertTimestamp(doc.data().submittedAt),
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as ArtisanProposal[];
}

// Escrow Transaction operations
export async function createEscrowTransaction(transaction: Omit<EscrowTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'escrowTransactions'), {
    ...transaction,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getEscrowTransaction(transactionId: string): Promise<EscrowTransaction | null> {
  const transactionDoc = await getDoc(doc(db, 'escrowTransactions', transactionId));
  if (!transactionDoc.exists()) return null;
  
  const data = transactionDoc.data();
  return {
    ...data,
    id: transactionDoc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as EscrowTransaction;
}

export async function updateEscrowTransaction(transactionId: string, updates: Partial<EscrowTransaction>): Promise<void> {
  await updateDoc(doc(db, 'escrowTransactions', transactionId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getEscrowTransactions(filters?: {
  clientId?: string;
  artisanId?: string;
  status?: string;
  limit?: number;
}): Promise<EscrowTransaction[]> {
  const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (filters?.clientId) {
    queryConstraints.push(where('clientId', '==', filters.clientId));
  }
  if (filters?.artisanId) {
    queryConstraints.push(where('artisanId', '==', filters.artisanId));
  }
  if (filters?.status) {
    queryConstraints.push(where('status', '==', filters.status));
  }
  if (filters?.limit) {
    queryConstraints.push(limit(filters.limit));
  }

  const q = query(collection(db, 'escrowTransactions'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as EscrowTransaction[];
}

// Withdrawal Account operations
export async function createWithdrawalAccount(account: Omit<WithdrawalAccount, 'createdAt' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'withdrawalAccounts', account.userId), {
    ...account,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getWithdrawalAccount(userId: string): Promise<WithdrawalAccount | null> {
  const accountDoc = await getDoc(doc(db, 'withdrawalAccounts', userId));
  if (!accountDoc.exists()) return null;
  
  return accountDoc.data() as WithdrawalAccount;
}

export async function updateWithdrawalAccount(userId: string, updates: Partial<WithdrawalAccount>): Promise<void> {
  await updateDoc(doc(db, 'withdrawalAccounts', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Notification operations
export async function createNotification(notification: Omit<NotificationItem, 'id' | 'timestamp'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notification,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function getNotifications(userId: string, limitCount: number = 50): Promise<NotificationItem[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    timestamp: convertTimestamp(doc.data().timestamp),
  })) as NotificationItem[];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
}

export async function clearAllNotifications(userId: string): Promise<void> {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

// Dispute operations
export async function createDispute(disputeData: Omit<DisputeItem, 'id' | 'createdAt' | 'lastUpdatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'disputes'), {
    ...disputeData,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getDisputes(filters?: { status?: DisputeItem['status'], limit?: number }): Promise<DisputeItem[]> {
  const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (filters?.status) {
    queryConstraints.push(where('status', '==', filters.status));
  }
  if (filters?.limit) {
    queryConstraints.push(limit(filters.limit));
  }
  const q = query(collection(db, 'disputes'), ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: convertTimestamp(doc.data().createdAt),
    lastUpdatedAt: convertTimestamp(doc.data().lastUpdatedAt),
  })) as DisputeItem[];
}

export async function updateDispute(disputeId: string, updates: Partial<DisputeItem>): Promise<void> {
  await updateDoc(doc(db, 'disputes', disputeId), {
    ...updates,
    lastUpdatedAt: serverTimestamp(),
  });
}

// Real-time subscriptions
export function subscribeToServiceRequests(
  filters: { status?: string; category?: string },
  callback: (requests: ServiceRequest[]) => void
): Unsubscribe {
  const queryConstraints: QueryConstraint[] = [orderBy('postedAt', 'desc')];
  if (filters.status) {
    queryConstraints.push(where('status', '==', filters.status));
  }
  if (filters.category) {
    queryConstraints.push(where('category', '==', filters.category));
  }

  const q = query(collection(db, 'serviceRequests'), ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      postedAt: convertTimestamp(doc.data().postedAt),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
    })) as ServiceRequest[];
    callback(requests);
  });
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: convertTimestamp(doc.data().timestamp),
    })) as NotificationItem[];
    callback(notifications);
  }, (error) => {
    console.error("Error in notifications snapshot listener: ", error);
  });
}
