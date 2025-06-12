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
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  Unsubscribe
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
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// User operations
export async function createUser(userData: Omit<User, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', userData.id), {
    ...userData,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return {
    ...data,
    createdAt: convertTimestamp(data.createdAt),
  } as User;
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
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as unknown as ArtisanProfile;
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
  let q = query(collection(db, 'artisanProfiles'));

  if (filters?.services && filters.services.length > 0) {
    q = query(q, where('servicesOffered', 'array-contains-any', filters.services));
  }

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as unknown as ArtisanProfile[];
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
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as unknown as ClientProfile;
}

export async function updateClientProfile(userId: string, updates: Partial<ClientProfile>): Promise<void> {
  await updateDoc(doc(db, 'clientProfiles', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Service Request operations
export async function createServiceRequest(request: Omit<ServiceRequest, 'id' | 'postedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'serviceRequests'), {
    ...request,
    postedAt: serverTimestamp(),
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
  status?: string;
  category?: string;
  limit?: number;
}): Promise<ServiceRequest[]> {
  let q = query(collection(db, 'serviceRequests'), orderBy('postedAt', 'desc'));

  if (filters?.clientId) {
    q = query(q, where('clientId', '==', filters.clientId));
  }

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    postedAt: convertTimestamp(doc.data().postedAt),
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
  status?: string;
}): Promise<ArtisanProposal[]> {
  let q = query(collection(db, 'proposals'), orderBy('submittedAt', 'desc'));

  if (filters.serviceRequestId) {
    q = query(q, where('serviceRequestId', '==', filters.serviceRequestId));
  }

  if (filters.artisanId) {
    q = query(q, where('artisanId', '==', filters.artisanId));
  }

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    submittedAt: convertTimestamp(doc.data().submittedAt),
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

export async function getEscrowTransactions(filters: {
  clientId?: string;
  artisanId?: string;
  status?: string;
}): Promise<EscrowTransaction[]> {
  let q = query(collection(db, 'escrowTransactions'), orderBy('createdAt', 'desc'));

  if (filters.clientId) {
    q = query(q, where('clientId', '==', filters.clientId));
  }

  if (filters.artisanId) {
    q = query(q, where('artisanId', '==', filters.artisanId));
  }

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: convertTimestamp(doc.data().createdAt),
    updatedAt: convertTimestamp(doc.data().updatedAt),
  })) as EscrowTransaction[];
}

// Withdrawal Account operations
export async function createWithdrawalAccount(account: WithdrawalAccount): Promise<void> {
  await setDoc(doc(db, 'withdrawalAccounts', account.userId), {
    ...account,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

// Real-time subscriptions
export function subscribeToServiceRequests(
  filters: { status?: string; category?: string },
  callback: (requests: ServiceRequest[]) => void
): Unsubscribe {
  let q = query(collection(db, 'serviceRequests'), orderBy('postedAt', 'desc'));

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      postedAt: convertTimestamp(doc.data().postedAt),
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
  });
}