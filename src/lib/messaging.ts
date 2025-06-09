import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDoc,
  setDoc,
  Unsubscribe,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType?: 'text' | 'image' | 'file' | 'google_meet_link';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    meetingUrl?: string;
  };
}

export interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      name: string;
      avatarUrl?: string;
      role: 'client' | 'artisan';
    };
  };
  lastMessage?: {
    text: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class MessagingService {
  // Create or get existing chat between two users
  async getOrCreateChat(userId1: string, userId2: string, userDetails: {
    [key: string]: { name: string; avatarUrl?: string; role: 'client' | 'artisan' };
  }): Promise<string> {
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        participants: [userId1, userId2],
        participantDetails: userDetails,
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return chatId;
  }

  // Send a message
  async sendMessage(
    chatId: string,
    senderId: string,
    receiverId: string,
    text: string,
    messageType: 'text' | 'image' | 'file' | 'google_meet_link' = 'text',
    metadata?: any
  ): Promise<string> {
    // Add message to messages subcollection
    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
      chatId,
      senderId,
      receiverId,
      text,
      messageType,
      metadata,
      isRead: false,
      timestamp: serverTimestamp(),
    });

    // Update chat with last message and increment unread count
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId,
      },
      [`unreadCount.${receiverId}`]: (await getDoc(chatRef)).data()?.unreadCount?.[receiverId] + 1 || 1,
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  }

  // Subscribe to messages in a chat
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): Unsubscribe {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];
      callback(messages);
    });
  }

  // Subscribe to user's chats
  subscribeToChats(
    userId: string,
    callback: (chats: Chat[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        lastMessage: doc.data().lastMessage ? {
          ...doc.data().lastMessage,
          timestamp: doc.data().lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Chat[];
      callback(chats);
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });

    // TODO: Also mark individual messages as read if needed
  }

  // Create Google Meet link
  generateGoogleMeetLink(): string {
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/new?authuser=0&hs=179&pli=1&ijlm=${meetingId}`;
  }

  // Send Google Meet link
  async sendMeetingLink(
    chatId: string,
    senderId: string,
    receiverId: string
  ): Promise<string> {
    const meetingUrl = this.generateGoogleMeetLink();
    
    return await this.sendMessage(
      chatId,
      senderId,
      receiverId,
      `Video call invitation: ${meetingUrl}`,
      'google_meet_link',
      { meetingUrl }
    );
  }
}

export const messagingService = new MessagingService();