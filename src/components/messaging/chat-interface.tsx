
"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, Video, Smile, Search, MessageSquare, Loader2 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { UserRole } from '@/types';

// Mock data
interface User { id: string; name: string; avatarUrl?: string; online?: boolean; }
interface Message { id: string; senderId: string; text: string; timestamp: Date; isOwn: boolean; }
interface Conversation { id: string; otherUser: User; lastMessage: string; lastMessageTime: string; unreadCount?: number; }

const MOCK_CLIENT_USER_ID = "client_jane_doe"; // Matches service request mock
const MOCK_ARTISAN_USER_ID = "artisan_john_bull"; // Matches service request mock

const mockClientUser: User = { id: MOCK_CLIENT_USER_ID, name: "You (Jane Client)", avatarUrl: "https://placehold.co/40x40.png?text=JC" };
const mockArtisanUser: User = { id: MOCK_ARTISAN_USER_ID, name: "You (John Artisan)", avatarUrl: "https://placehold.co/40x40.png?text=JA" };

const mockArtisanProfilesForChat: User[] = [
  { id: MOCK_ARTISAN_USER_ID, name: "John Bull Catering", avatarUrl: "https://placehold.co/40x40.png?text=JB", online: true },
  { id: "artisan_ada_eze", name: "Ada's Kitchen Deluxe", avatarUrl: "https://placehold.co/40x40.png?text=AKD", online: false },
  { id: "artisan_musa_ali", name: "Musa Electrics", avatarUrl: "https://placehold.co/40x40.png?text=ME", online: true },
];

const mockClientProfilesForChat: User[] = [
 { id: MOCK_CLIENT_USER_ID, name: "Jane Doe (Event Client)", avatarUrl: "https://placehold.co/40x40.png?text=JD", online: true },
 { id: "client_adewale", name: "Adewale Plumbing Client", avatarUrl: "https://placehold.co/40x40.png?text=AP", online: false },
];


const generateClientConversations = (): Conversation[] => [
  { id: `conv_client_${MOCK_ARTISAN_USER_ID}`, otherUser: mockArtisanProfilesForChat[0], lastMessage: "Great, thank you for the update!", lastMessageTime: "11:30 AM", unreadCount: 0},
  { id: `conv_client_artisan_ada_eze`, otherUser: mockArtisanProfilesForChat[1], lastMessage: "Yes, that sounds good.", lastMessageTime: "Tue"},
  { id: `conv_client_artisan_musa_ali`, otherUser: mockArtisanProfilesForChat[2], lastMessage: "Can you check this for me?", lastMessageTime: "Mon", unreadCount: 1},
];

const generateArtisanConversations = (): Conversation[] => [
  { id: `conv_artisan_${MOCK_CLIENT_USER_ID}`, otherUser: mockClientProfilesForChat[0], lastMessage: "Great, thank you for the update!", lastMessageTime: "11:30 AM", unreadCount: 0},
  { id: `conv_artisan_client_adewale`, otherUser: mockClientProfilesForChat[1], lastMessage: "I have a quick question.", lastMessageTime: "Yesterday"},
];

const mockMessages: { [conversationId: string]: Message[] } = {
  [`conv_client_${MOCK_ARTISAN_USER_ID}`]: [ // Client Jane chatting with Artisan John
    { id: "msg_jd1", senderId: MOCK_ARTISAN_USER_ID, text: "Hi Jane! Yes, everything is on track. We're preparing the 'Modern Elegance' menu.", timestamp: new Date(Date.now() - 3600000 * 1.9), isOwn: false },
    { id: "msg_jb1", senderId: MOCK_CLIENT_USER_ID, text: "Excellent! Do you need any more information from my side?", timestamp: new Date(Date.now() - 3600000 * 1.8), isOwn: true },
    { id: "msg_jd2", senderId: MOCK_ARTISAN_USER_ID, text: "Not at the moment, thank you. We'll deliver and set up by 5 PM on the event day.", timestamp: new Date(Date.now() - 3600000 * 1.7), isOwn: false },
    { id: "msg_jb2", senderId: MOCK_CLIENT_USER_ID, text: "Great, thank you for the update!", timestamp: new Date(Date.now() - 3600000 * 1.5), isOwn: true },
  ],
  [`conv_artisan_${MOCK_CLIENT_USER_ID}`]: [ // Artisan John chatting with Client Jane
    { id: "msg_aj1", senderId: MOCK_CLIENT_USER_ID, text: "Hi John, just wanted to confirm the details for the corporate event catering.", timestamp: new Date(Date.now() - 3600000 * 2), isOwn: false },
    { id: "msg_ja1", senderId: MOCK_ARTISAN_USER_ID, text: "Hi Jane! Yes, everything is on track. We're preparing the 'Modern Elegance' menu.", timestamp: new Date(Date.now() - 3600000 * 1.9), isOwn: true },
    { id: "msg_aj2", senderId: MOCK_CLIENT_USER_ID, text: "Excellent! Do you need any more information from my side?", timestamp: new Date(Date.now() - 3600000 * 1.8), isOwn: false },
    { id: "msg_ja2", senderId: MOCK_ARTISAN_USER_ID, text: "Not at the moment, thank you. We'll deliver and set up by 5 PM on the event day.", timestamp: new Date(Date.now() - 3600000 * 1.7), isOwn: true },
    { id: "msg_aj3", senderId: MOCK_CLIENT_USER_ID, text: "Great, thank you for the update!", timestamp: new Date(Date.now() - 3600000 * 1.5), isOwn: false },
  ],
   // Add more mock messages for other conversations if needed
   [`conv_client_artisan_ada_eze`]: [
    { id: "msg_ada1", senderId: "artisan_ada_eze", text: "Hello, regarding your event...", timestamp: new Date(Date.now() - 86400000 * 2), isOwn: false },
    { id: "msg_ada2", senderId: MOCK_CLIENT_USER_ID, text: "Yes, that sounds good.", timestamp: new Date(Date.now() - 86400000 * 1.9), isOwn: true },
  ],
  [`conv_artisan_client_adewale`]: [
    { id: "msg_adew1", senderId: "client_adewale", text: "Good day, I need a quote for plumbing.", timestamp: new Date(Date.now() - 86400000 * 1), isOwn: false },
    { id: "msg_adew2", senderId: MOCK_ARTISAN_USER_ID, text: "Sure, what exactly do you need?", timestamp: new Date(Date.now() - 86400000 * 0.9), isOwn: true },
  ],
};


function ChatInterfaceContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<User>(mockClientUser); // Default to client
  const [conversations, setConversations] = useState<Conversation[]>(generateClientConversations());
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const userRole = searchParams.get("role") as UserRole | null;

  useEffect(() => {
    setIsInitializing(true);
    const roleToSet = userRole || 'client'; // Default to client if no role
    
    if (roleToSet === 'client') {
      setCurrentUser(mockClientUser);
      setConversations(generateClientConversations());
    } else { // artisan
      setCurrentUser(mockArtisanUser);
      setConversations(generateArtisanConversations());
    }
    setIsInitializing(false); // Done with role-based setup
  }, [userRole]);


  useEffect(() => {
    // This effect runs after initial role setup AND when conversations list changes
    if (isInitializing) return; // Don't run if still setting up role

    const chatWithUserId = searchParams.get('chatWith');
    let conversationToSelect: Conversation | undefined = undefined;

    if (chatWithUserId) {
      conversationToSelect = conversations.find(conv => conv.otherUser.id === chatWithUserId);
    }
    
    if (conversationToSelect) {
      setSelectedConversation(conversationToSelect);
    } else if (conversations.length > 0) {
      setSelectedConversation(conversations[0]); // Default to first conversation in the list
    } else {
      setSelectedConversation(null); // No conversations available
    }
  }, [searchParams, conversations, isInitializing]);


  useEffect(() => {
    if (selectedConversation && !isInitializing) {
      // Key for messages should incorporate current user's role context if necessary
      // For this mock, conversation ID is enough if it's unique across roles or pre-generated
      const convMessages = mockMessages[selectedConversation.id] || [];
      // Adjust 'isOwn' based on the actual currentUser.id
      setMessages(convMessages.map(m => ({...m, isOwn: m.senderId === currentUser.id })));
    } else if (!selectedConversation && !isInitializing) {
      setMessages([]);
    }
  }, [selectedConversation, isInitializing, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedConversation) return;
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
      isOwn: true, // Always true when sending
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Update mockMessages for persistence in this session
    if (!mockMessages[selectedConversation.id]) {
        mockMessages[selectedConversation.id] = [];
    }
    mockMessages[selectedConversation.id].push({...newMsg, isOwn: false}); // Store as if received by other party for their view
    
    setNewMessage("");
  };
  
  const createGoogleMeetLink = () => {
    const meetLink = `https://meet.google.com/new?uid=${Math.random().toString(36).substring(2)}&utm_medium=web&utm_source=zelo`;
    if (!selectedConversation) return;
    const textMsgContent = `I've created a Google Meet link for our video chat. Click to join:`;
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: currentUser.id,
      text: textMsgContent,
      timestamp: new Date(),
      isOwn: true,
    };
    const linkMsg: Message = {
      id: `msg${Date.now() + 1}`, // Ensure unique ID
      senderId: currentUser.id,
      text: meetLink,
      timestamp: new Date(Date.now() + 1000), // Slightly later timestamp for ordering
      isOwn: true,
    };
    setMessages(prev => [...prev, newMsg, linkMsg]);

    if (!mockMessages[selectedConversation.id]) {
        mockMessages[selectedConversation.id] = [];
    }
    mockMessages[selectedConversation.id].push({...newMsg, isOwn: false});
    mockMessages[selectedConversation.id].push({...linkMsg, isOwn: false});
  };

  if (isInitializing) {
    return (
      <div className="flex h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-sm items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-sm">
      {/* Sidebar with conversations */}
      <div className="w-1/3 border-r lg:w-1/4">
        <div className="p-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-8" />
            </div>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100%-65px)]">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                "group flex cursor-pointer items-center gap-3 p-3",
                "hover:bg-accent hover:text-accent-foreground",
                selectedConversation?.id === conv.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => setSelectedConversation(conv)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={conv.otherUser.avatarUrl} 
                  alt={conv.otherUser.name} 
                  data-ai-hint="profile avatar" 
                  className="object-cover"
                />
                <AvatarFallback>{conv.otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                {conv.otherUser.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold">{conv.otherUser.name}</p>
                <p className={cn(
                    "truncate text-xs",
                    selectedConversation?.id === conv.id 
                        ? "text-accent-foreground/80" 
                        : "text-muted-foreground group-hover:text-accent-foreground/80"
                  )}
                >
                  {conv.lastMessage}
                </p>
              </div>
              <div className={cn(
                  "text-right text-xs",
                  selectedConversation?.id === conv.id 
                      ? "text-accent-foreground/70" 
                      : "text-muted-foreground group-hover:text-accent-foreground/70"
                )}
              >
                <p>{conv.lastMessageTime}</p>
                {conv.unreadCount && conv.unreadCount > 0 && (
                    <span className={cn(
                        "mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        selectedConversation?.id === conv.id 
                            ? "bg-accent-foreground/20 text-accent-foreground" 
                            : "bg-primary text-primary-foreground group-hover:bg-accent-foreground/20 group-hover:text-accent-foreground"
                      )}
                    >
                        {conv.unreadCount}
                    </span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 border-b p-3">
              <Avatar>
                <AvatarImage 
                  src={selectedConversation.otherUser.avatarUrl} 
                  alt={selectedConversation.otherUser.name} 
                  data-ai-hint="profile avatar" 
                  className="object-cover"
                />
                <AvatarFallback>{selectedConversation.otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                 {selectedConversation.otherUser.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />}
              </Avatar>
              <div>
                <p className="font-semibold">{selectedConversation.otherUser.name}</p>
                <p className="text-xs text-muted-foreground">{selectedConversation.otherUser.online ? "Online" : "Offline"}</p>
              </div>
              <div className="ml-auto">
                <Button variant="ghost" size="icon" onClick={createGoogleMeetLink} title="Create Google Meet Link">
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex max-w-[75%] flex-col gap-1",
                      msg.isOwn ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm shadow",
                        msg.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      )}
                    >
                      {msg.text.startsWith("https://meet.google.com") ? (
                        <Link href={msg.text} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                          {msg.text}
                        </Link>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {conversations.length > 0 ? "Select a conversation to start chatting" : "No conversations yet"}
            </p>
            <p className="text-sm text-muted-foreground">
                {conversations.length > 0 
                    ? "Or find artisans and clients to connect with."
                    : "Start by browsing services or posting a request to connect with others."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap the ChatInterfaceContent with Suspense for useSearchParams
export function ChatInterface() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-sm items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Initializing chat...</p>
      </div>
    }>
      <ChatInterfaceContent />
    </Suspense>
  )
}
