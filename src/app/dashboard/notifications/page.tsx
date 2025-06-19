
"use client"; 

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Bell, Check, Trash2, Briefcase, MessageSquare, Coins, Award, Settings, Info, Loader2,
  LayoutDashboard, UserCircle, CreditCard, Users, LogOut, MapPin, PlusCircle, 
  ShieldCheck, FileText, Search, ClipboardList, UserCog, UserCircle2, CheckCircle2, Menu, 
  Camera, UploadCloud, CalendarDays, Edit, ListChecks, ShoppingCart, Edit3, 
  AlertTriangle, SlidersHorizontal, Activity,
  type LucideIcon
} from "lucide-react";
import type { NotificationItem, LucideIconName } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/providers/auth-provider';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle, Briefcase, MessageSquare, Settings, CreditCard,
  Users, LogOut, MapPin, PlusCircle, ShieldCheck, FileText, Search, ClipboardList,
  UserCog, UserCircle2, Award, CheckCircle2, Menu, Camera, UploadCloud,
  CalendarDays, Edit, Bell, Check, Trash2, Coins, Info, ListChecks, ShoppingCart,
  Edit3, AlertTriangle, SlidersHorizontal, Activity
};

export default function NotificationsPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const userNotifications = await getNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Error", description: "Could not load notifications.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authUser?.uid) {
      fetchNotifications(authUser.uid);
    } else if (!authLoading && !authUser) {
      setIsLoading(false); 
    }
  }, [authUser, authLoading, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast({ title: "Error", description: "Could not mark notification as read.", variant: "destructive" });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!authUser?.uid) return;
    try {
      await markAllNotificationsAsRead(authUser.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      toast({ title: "Error", description: "Could not mark all notifications as read.", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
     if (!authUser?.uid) return;
    try {
      await clearAllNotifications(authUser.uid);
      setNotifications([]);
      toast({ title: "Notifications Cleared", description: "All your notifications have been removed." });
    } catch (error) {
       toast({ title: "Error", description: "Could not clear notifications.", variant: "destructive" });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (authLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading notifications...</p>
        </div>
    );
  }
  
  if (!authUser) {
    return (
        <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Please log in</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log in to see your notifications.</p>
             <Button asChild className="mt-6">
                <Link href={`/login?redirect=/dashboard/notifications`}>Login</Link>
            </Button>
        </div>
    );
  }

  if (isLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Fetching your notifications...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <Check className="mr-2 h-4 w-4" /> Mark All as Read
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
             <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Notifications</CardTitle>
          <CardDescription>Stay updated with your Zelo account activity.</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notif) => {
                const IconToRender = iconComponentsMap[notif.icon] || Bell; 
                const content = (
                  <div className={cn("flex items-start gap-4 p-4 rounded-lg border transition-colors", notif.read ? "bg-card hover:bg-secondary/50" : "bg-primary/5 font-medium border-primary/20 hover:bg-primary/10")}>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shrink-0 mt-1", notif.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}><IconToRender className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={cn("text-sm font-semibold", notif.read ? "text-foreground" : "text-foreground")}>{notif.title}</h4>
                        {!notif.read && <Badge variant="default" className="h-2 w-2 p-0 rounded-full shrink-0" title="Unread" />}
                      </div>
                      {notif.description && <p className="text-xs text-muted-foreground">{notif.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{notif.timestamp ? formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true }) : 'Recently'}</p>
                    </div>
                    {!notif.read && (<Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notif.id); }} className="text-xs self-start">Mark Read</Button>)}
                  </div>
                );
                return (<li key={notif.id}>{notif.link ? (<Link href={notif.link} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">{content}</Link>) : (content)}</li>);
              })}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-2 text-lg font-medium text-foreground">No notifications yet.</h3>
              <p className="mt-1 text-sm text-muted-foreground">We'll let you know when there's something new for you.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
