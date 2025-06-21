
"use client";

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, Video, Smile, Search, MessageSquare, Loader2, UserCircle2, Briefcase } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { AuthUser, UserRole } from '@/types';
import { messagingService, type ChatMessage, type Chat, type ChatParticipantDetail } from '@/lib/messaging';
import { useAuthContext } from '@/components/providers/auth-provider';
import { getArtisanProfile, getClientProfile } from '@/lib/firestore'; // For fetching profile details
import { Skeleton } from '@/components/ui/skeleton';

function ChatInterfaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuthContext();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [conversations, setConversations] = useState<Chat[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Set current user from auth context
  useEffect(() => {
    if (!authLoading) {
      setCurrentUser(authUser);
    }
  }, [authUser, authLoading]);

  // Subscribe to conversations
  useEffect(() => {
    if (currentUser?.uid) {
      setIsInitializing(true);
      const unsubscribe = messagingService.subscribeToChats(currentUser.uid, (fetchedConversations) => {
        setConversations(fetchedConversations);
        
        // Handle initial conversation selection after chats are loaded
        const chatWithUserId = searchParams.get('chatWith');
        if (chatWithUserId) {
          const targetConv = fetchedConversations.find(c => c.participants.includes(chatWithUserId));
          if (targetConv && (!selectedConversation || selectedConversation.id !== targetConv.id)) {
            setSelectedConversation(targetConv);
          }
        }
        setIsInitializing(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !currentUser) {
      setIsInitializing(false); // No user, stop initializing
      setConversations([]);
    }
  }, [currentUser, searchParams, selectedConversation]);

  // Subscribe to messages of the selected conversation
  useEffect(() => {
    if (selectedConversation?.id && currentUser?.uid) {
      const unsubscribe = messagingService.subscribeToMessages(selectedConversation.id, setMessages);
      messagingService.markMessagesAsRead(selectedConversation.id, currentUser.uid);
      return () => unsubscribe();
    } else {
      setMessages([]); // Clear messages if no conversation selected
    }
  }, [selectedConversation, currentUser?.uid]);


  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleInitiateChat = useCallback(async (otherUserId: string) => {
    if (!currentUser || !currentUser.uid || !currentUser.role) {
        console.error("Current user not available to initiate chat.");
        return;
    }
    
    const otherUserRole = currentUser.role === 'client' ? 'artisan' : 'client'; // Simple assumption

    let currentUserDetails: ChatParticipantDetail | undefined;
    if (currentUser.role === 'client') {
        const profile = await getClientProfile(currentUser.uid);
        currentUserDetails = { name: profile?.fullName || currentUser.displayName || "User", avatarUrl: profile?.avatarUrl, role: 'client', isOnline: true };
    } else if (currentUser.role === 'artisan') {
        const profile = await getArtisanProfile(currentUser.uid);
        currentUserDetails = { name: profile?.fullName || currentUser.displayName || "User", avatarUrl: profile?.profilePhotoUrl, role: 'artisan', isOnline: true };
    }
    
    let otherUserDetails: ChatParticipantDetail | undefined;
    if (otherUserRole === 'client') {
        const profile = await getClientProfile(otherUserId);
        otherUserDetails = { name: profile?.fullName || "Client", avatarUrl: profile?.avatarUrl, role: 'client', isOnline: false };
    } else { // artisan
        const profile = await getArtisanProfile(otherUserId);
        otherUserDetails = { name: profile?.username || profile?.fullName || "Artisan", avatarUrl: profile?.profilePhotoUrl, role: 'artisan', isOnline: false };
    }

    if (!currentUserDetails || !otherUserDetails) {
        console.error("Could not fetch participant details for chat creation.");
        return;
    }
    
    const participantDetailsMap = {
        [currentUser.uid]: currentUserDetails,
        [otherUserId]: otherUserDetails,
    };

    try {
        const chatId = await messagingService.getOrCreateChat(currentUser.uid, otherUserId, participantDetailsMap);
        const chatToSelect = conversations.find(c => c.id === chatId) || 
                             { id: chatId, participants: [currentUser.uid, otherUserId], participantDetails: participantDetailsMap, unreadCount: {}, createdAt: new Date(), updatedAt: new Date() };
        setSelectedConversation(chatToSelect);
         if (router && searchParams.has('chatWith')) {
           router.replace('/dashboard/messages', undefined);
        }
    } catch (error) {
        console.error("Error initiating chat:", error);
    }
  }, [currentUser, router, searchParams, conversations]);


  useEffect(() => {
    const chatWithId = searchParams.get('chatWith');
    if (chatWithId && currentUser && !isInitializing) {
      const existingConv = conversations.find(c => c.participants.includes(chatWithId));
      if (existingConv) {
        if (!selectedConversation || selectedConversation.id !== existingConv.id) {
          setSelectedConversation(existingConv);
        }
      } else {
        handleInitiateChat(chatWithId);
      }
    }
  }, [searchParams, currentUser, isInitializing, conversations, selectedConversation, handleInitiateChat]);


  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedConversation || !currentUser || isSending) return;
    
    const otherParticipantId = selectedConversation.participants.find(pId => pId !== currentUser.uid);
    if (!otherParticipantId) {
      console.error("Could not find other participant in selected conversation");
      return;
    }

    setIsSending(true);
    try {
      await messagingService.sendMessage(selectedConversation.id, currentUser.uid, otherParticipantId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  const createGoogleMeetLinkAndSend = async () => {
    if (!selectedConversation || !currentUser || isSending) return;
    const otherParticipantId = selectedConversation.participants.find(pId => pId !== currentUser.uid);
    if (!otherParticipantId) return;

    setIsSending(true);
    try {
        const meetingUrl = messagingService.generateGoogleMeetLink();
        await messagingService.sendMessage(
            selectedConversation.id, 
            currentUser.uid, 
            otherParticipantId, 
            `I've created a Google Meet link for our video chat: ${meetingUrl}`, 
            'google_meet_link', 
            { meetingUrl }
        );
    } catch (error) {
        console.error("Error sending Google Meet link:", error);
    } finally {
        setIsSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-sm items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading user session...</p>
      </div>
    );
  }
  
  if (!currentUser) {
     return (
      <div className="flex h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-sm items-center justify-center text-center p-6">
        <div>
            <UserCircle2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Please log in to view your messages.</p>
            <Button asChild className="mt-4">
                <Link href={`/login?redirect=/dashboard/messages`}>Login</Link>
            </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-full rounded-lg border bg-card shadow-sm">
      {/* Sidebar with conversations */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
        <div className="p-3">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-8 h-9" />
            </div>
        </div>
        <Separator />
        <ScrollArea className="flex-grow">
          {isInitializing ? (
            <div className="p-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4 rounded bg-muted" />
                    <Skeleton className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => {
              const otherUserId = conv.participants.find(pId => pId !== currentUser.uid);
              const otherUserDetails = otherUserId ? conv.participantDetails[otherUserId] : { name: "Unknown User", avatarUrl: undefined, role: "client", isOnline: false };
              const unread = conv.unreadCount[currentUser.uid] || 0;
              const isActive = selectedConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 p-3 transition-colors rounded-md mx-2 my-1",
                    isActive
                      ? "bg-primary/10"
                      : "hover:bg-primary/10"
                  )}
                  onClick={() => {
                    setSelectedConversation(conv);
                    if(router && searchParams.has('chatWith')) { 
                      router.replace('/dashboard/messages', undefined);
                    }
                  }}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={otherUserDetails.avatarUrl} 
                        alt={otherUserDetails.name} 
                        data-ai-hint="profile avatar" 
                        className="object-cover"
                      />
                      <AvatarFallback>{otherUserDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {otherUserDetails.isOnline && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card border border-transparent" title="Online" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={cn(
                        "truncate font-semibold",
                        isActive || "group-hover:text-primary" ? "text-primary" : "text-foreground"
                      )}
                    >
                      {otherUserDetails.name}
                    </p>
                    <p className={cn(
                        "truncate text-xs",
                        isActive
                          ? (unread > 0 ? "font-bold text-primary/90" : "text-primary/80")
                          : unread > 0
                            ? "font-bold text-primary group-hover:text-primary"
                            : "text-muted-foreground group-hover:text-primary/80"
                      )}
                    >
                      {conv.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <p className={cn(
                        isActive || "group-hover:text-primary/70" ? "text-primary/70" : "text-muted-foreground"
                      )}
                    >
                      {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ""}
                    </p>
                    {unread > 0 && (
                        <span className={cn(
                            "inline-flex items-center justify-center rounded-full h-4 min-w-[1rem] px-1.5 py-0.5 text-xs font-semibold leading-none",
                            isActive ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground group-hover:bg-primary/90"
                          )}
                        >
                            {unread}
                        </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                 <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                 <p className="text-sm font-medium text-muted-foreground">No conversations yet.</p>
                 <p className="text-xs text-muted-foreground">
                    Start a chat by contacting an artisan or client.
                 </p>
                 <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto" asChild>
                    <Link href={`/dashboard/services/browse?role=${currentUser.role}`}>Browse Professionals</Link>
                 </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex-col hidden md:flex">
        {selectedConversation && currentUser ? (
          <>
            <div className="flex items-center gap-3 border-b p-3">
              <Avatar>
                <AvatarImage 
                  src={selectedConversation.participantDetails[selectedConversation.participants.find(p=>p !== currentUser.uid)!]?.avatarUrl} 
                  alt={selectedConversation.participantDetails[selectedConversation.participants.find(p=>p !== currentUser.uid)!]?.name} 
                  data-ai-hint="profile avatar" 
                  className="object-cover"
                />
                <AvatarFallback>{selectedConversation.participantDetails[selectedConversation.participants.find(p=>p !== currentUser.uid)!]?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedConversation.participantDetails[selectedConversation.participants.find(p=>p !== currentUser.uid)!]?.name}</p>
              </div>
              <div className="ml-auto">
                <Button variant="ghost" size="icon" onClick={createGoogleMeetLinkAndSend} title="Create Google Meet Link" disabled={isSending}>
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-secondary/20">
              <div className="space-y-4">
                {messages.map(msg => {
                   const isOwnMessage = msg.senderId === currentUser.uid;
                   return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex max-w-[75%] flex-col gap-1",
                          isOwnMessage ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm shadow",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-card"
                          )}
                        >
                          {msg.messageType === 'google_meet_link' && msg.metadata?.meetingUrl ? (
                            <>
                                <p>{msg.text.replace(msg.metadata.meetingUrl, '').trim()}</p>
                                <Link href={msg.metadata.meetingUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 font-medium block mt-1">
                                Join Google Meet
                                </Link>
                            </>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                   );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3 bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={isSending}><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" disabled={isSending}><Paperclip className="h-5 w-5" /></Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                  className="flex-1 h-9"
                  disabled={isSending}
                />
                <Button onClick={handleSendMessage} size="icon" disabled={isSending || newMessage.trim() === ""}>
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 bg-secondary/20">
            {isInitializing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading conversations...</p>
                </>
            ) : conversations.length > 0 ? (
                <>
                    <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Select a conversation</p>
                    <p className="text-sm text-muted-foreground">Choose a chat from the sidebar to view messages.</p>
                </>
            ) : (
                <>
                    <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Welcome to Zelo Messages!</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Connect with clients or artisans by starting a conversation from their profile or a service request.
                    </p>
                     <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href={`/dashboard/services/browse?role=${currentUser?.role || 'client'}`}>
                            <Search className="mr-2 h-4 w-4" /> Browse & Connect
                        </Link>
                    </Button>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatInterface() {
  return (
    <Suspense fallback={
      <div className="flex h-full rounded-lg border bg-card shadow-sm items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading chat interface...</p>
      </div>
    }>
      <ChatInterfaceContent />
    </Suspense>
  )
}
