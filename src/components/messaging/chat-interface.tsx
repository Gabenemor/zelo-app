"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, Video, Smile, Search } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock data
interface User { id: string; name: string; avatarUrl?: string; online?: boolean; }
interface Message { id: string; senderId: string; text: string; timestamp: Date; isOwn: boolean; }
interface Conversation { id: string; otherUser: User; lastMessage: string; lastMessageTime: string; unreadCount?: number; }

const mockCurrentUser: User = { id: "user1", name: "You" };
const mockUsers: User[] = [
  { id: "user2", name: "Adewale Plumbing", avatarUrl: "https://placehold.co/40x40.png?text=AP", online: true },
  { id: "user3", name: "Chioma's Catering", avatarUrl: "https://placehold.co/40x40.png?text=CC", online: false },
  { id: "user4", name: "Musa Electrics", avatarUrl: "https://placehold.co/40x40.png?text=ME", online: true },
];

const mockConversations: Conversation[] = [
    { id: "conv1", otherUser: mockUsers[0], lastMessage: "Okay, I'll be there by 2 PM.", lastMessageTime: "10:30 AM", unreadCount: 2},
    { id: "conv2", otherUser: mockUsers[1], lastMessage: "Thanks for the quick service!", lastMessageTime: "Yesterday"},
    { id: "conv3", otherUser: mockUsers[2], lastMessage: "Can you send me a quote?", lastMessageTime: "Mon"},
];

const mockMessages: { [conversationId: string]: Message[] } = {
  "conv1": [
    { id: "msg1", senderId: "user2", text: "Hello! I'm interested in your plumbing service.", timestamp: new Date(Date.now() - 3600000 * 2), isOwn: false },
    { id: "msg2", senderId: "user1", text: "Hi Adewale, sure. What do you need help with?", timestamp: new Date(Date.now() - 3600000 * 1.9), isOwn: true },
    { id: "msg3", senderId: "user2", text: "My kitchen sink is leaking badly.", timestamp: new Date(Date.now() - 3600000 * 1.8), isOwn: false },
    { id: "msg4", senderId: "user1", text: "Okay, I can come take a look. When are you available?", timestamp: new Date(Date.now() - 3600000 * 1.7), isOwn: true },
    { id: "msg5", senderId: "user2", text: "Okay, I'll be there by 2 PM.", timestamp: new Date(Date.now() - 3600000 * 1.5), isOwn: false },
  ],
   "conv2": [
    { id: "msg6", senderId: "user3", text: "The food was amazing!", timestamp: new Date(Date.now() - 86400000 * 1), isOwn: false },
    { id: "msg7", senderId: "user1", text: "Glad you enjoyed it, Chioma!", timestamp: new Date(Date.now() - 86400000 * 0.9), isOwn: true },
    { id: "msg8", senderId: "user3", text: "Thanks for the quick service!", timestamp: new Date(Date.now() - 86400000 * 0.8), isOwn: false },
  ],
};


export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messages, setMessages] = useState<Message[]>(selectedConversation ? mockMessages[selectedConversation.id] || [] : []);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || []);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedConversation) return;
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: mockCurrentUser.id,
      text: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages(prev => [...prev, newMsg]);
    // Also update mockMessages for persistence in this demo
    mockMessages[selectedConversation.id] = [...(mockMessages[selectedConversation.id] || []), newMsg];
    setNewMessage("");
  };
  
  const createGoogleMeetLink = () => {
    // This is a placeholder. In a real app, you might make an API call to Google Calendar API
    // or construct a pre-filled link: https://meet.google.com/new?hs=180&authuser=0&ij=1
    // Or use a service that generates meet links.
    const meetLink = `https://meet.google.com/new?uid=${Math.random().toString(36).substring(2)}&utm_medium=web&utm_source=zelo`;
    
    // Add this link as a message
     if (!selectedConversation) return;
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: mockCurrentUser.id,
      text: `I've created a Google Meet link for our video chat: `,
      timestamp: new Date(),
      isOwn: true,
    };
    const linkMsg: Message = { // A separate message for the link itself for better formatting
      id: `msg${Date.now() + 1}`,
      senderId: mockCurrentUser.id,
      text: meetLink,
      timestamp: new Date(),
      isOwn: true,
    }
    setMessages(prev => [...prev, newMsg, linkMsg]);
    mockMessages[selectedConversation.id] = [...(mockMessages[selectedConversation.id] || []), newMsg, linkMsg];

    // Optionally, open the link in a new tab for the user who created it
    // window.open(meetLink, '_blank');
  };


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
          {mockConversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 p-3 hover:bg-accent",
                selectedConversation?.id === conv.id && "bg-accent"
              )}
              onClick={() => setSelectedConversation(conv)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={conv.otherUser.avatarUrl} alt={conv.otherUser.name} data-ai-hint="profile avatar" />
                <AvatarFallback>{conv.otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                {conv.otherUser.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold">{conv.otherUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{conv.lastMessageTime}</p>
                {conv.unreadCount && conv.unreadCount > 0 && (
                    <span className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
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
                <AvatarImage src={selectedConversation.otherUser.avatarUrl} alt={selectedConversation.otherUser.name} data-ai-hint="profile avatar" />
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
            <p className="mt-4 text-lg font-medium text-muted-foreground">Select a conversation to start chatting</p>
            <p className="text-sm text-muted-foreground">Or find artisans and clients to connect with.</p>
          </div>
        )}
      </div>
    </div>
  );
}
