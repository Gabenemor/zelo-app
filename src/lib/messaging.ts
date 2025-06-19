
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
  limit,
  Timestamp, // Added Timestamp
  arrayUnion, // For adding participants if not exists
  increment // For unread counts
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserRole } from '@/types'; // Import UserRole

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string; // Explicitly knowing the receiver helps with notifications/unread
  text: string;
  timestamp: Date | Timestamp; // Allow both for flexibility
  isRead: boolean;
  messageType?: 'text' | 'image' | 'file' | 'google_meet_link';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    meetingUrl?: string;
  };
}

export interface ChatParticipantDetail {
  name: string;
  avatarUrl?: string;
  role: UserRole; // Added role
}

export interface Chat {
  id: string; // Compound ID: sorted(userId1, userId2).join('_')
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: ChatParticipantDetail;
  };
  lastMessage?: {
    text: string;
    timestamp: Date | Timestamp;
    senderId: string;
  };
  unreadCount: {
    [userId: string]: number; // e.g., { userId1: 0, userId2: 3 }
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export class MessagingService {
  // Create or get existing chat between two users
  async getOrCreateChat(
    userId1: string, 
    userId2: string, 
    participantDetailsMap: { [key: string]: ChatParticipantDetail }
  ): Promise<string> {
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      // Ensure details for both participants are provided
      if (!participantDetailsMap[userId1] || !participantDetailsMap[userId2]) {
        console.error("Participant details missing for one or both users", {userId1, userId2, participantDetailsMap});
        throw new Error("Cannot create chat: Participant details missing.");
      }
      await setDoc(chatRef, {
        id: chatId,
        participants: [userId1, userId2],
        participantDetails: participantDetailsMap,
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Potentially update participant details if they've changed (e.g., avatar)
      // For simplicity, this example doesn't do deep merge/update of participantDetails on get.
    }
    return chatId;
  }

  // Send a message
  async sendMessage(
    chatId: string,
    senderId: string,
    receiverId: string,
    text: string,
    messageType: ChatMessage['messageType'] = 'text',
    metadata?: ChatMessage['metadata']
  ): Promise<string> {
    const messageData = {
      chatId,
      senderId,
      receiverId,
      text,
      messageType,
      metadata: metadata || {}, // Ensure metadata is at least an empty object
      isRead: false,
      timestamp: serverTimestamp(),
    };

    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    const chatRef = doc(db, 'chats', chatId);
    // Use Firebase's increment for unread count to handle concurrency
    await updateDoc(chatRef, {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId,
      },
      [`unreadCount.${receiverId}`]: increment(1),
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  }

  // Subscribe to messages in a chat
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
  ): Unsubscribe {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'), // Fetch newest first, then reverse for display
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          ...data,
          id: docSnapshot.id,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        } as ChatMessage;
      }).reverse(); // Reverse to show oldest first in UI
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
      const chats = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          ...data,
          id: docSnapshot.id,
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp instanceof Timestamp ? data.lastMessage.timestamp.toDate() : new Date(data.lastMessage.timestamp),
          } : undefined,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Chat;
      });
      callback(chats);
    });
  }

  // Mark messages as read FOR A SPECIFIC USER in a chat
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      const currentUnread = chatDoc.data()?.unreadCount?.[userId] || 0;
      if (currentUnread > 0) {
        await updateDoc(chatRef, {
          [`unreadCount.${userId}`]: 0,
        });
         console.log(`[MessagingService] Marked messages as read for user ${userId} in chat ${chatId}`);
      }
    }
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
      `Video call invitation: ${meetingUrl}`, // Main text for the message
      'google_meet_link', // Message type
      { meetingUrl } // Metadata containing the actual link
    );
  }
}

export const messagingService = new MessagingService();
