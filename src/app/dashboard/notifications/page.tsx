
"use client"; // For client-side interactions like state and button clicks

import React, { useState } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bell, Check, Trash2, Briefcase, MessageSquare, DollarSign, Award, Settings } from "lucide-react";
import type { NotificationItem, LucideIconName } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const mockNotifications: NotificationItem[] = [
  { id: "notif1", userId: "user123", type: "new_message", icon: "MessageSquare", title: "New message from Client Bola", description: "Regarding 'Website Design' project...", timestamp: new Date(Date.now() - 3600000 * 2), read: false, link: "/dashboard/messages?chatWith=clientBola" },
  { id: "notif2", userId: "user123", type: "job_awarded", icon: "Award", title: "Job 'Catering for Event' awarded!", description: "Client Chioma accepted your proposal. Fund escrow to begin.", timestamp: new Date(Date.now() - 86400000 * 1), read: false, link: "/dashboard/services/requests/req_catering_xyz" },
  { id: "notif3", userId: "user123", type: "payment_received", icon: "DollarSign", title: "Payment of ₦15,000 processed", description: "For 'Electrical Wiring Fix' completed.", timestamp: new Date(Date.now() - 86400000 * 3), read: true, link: "/dashboard/payments/history" },
  { id: "notif4", userId: "user123", type: "proposal_accepted", icon: "Briefcase", title: "Proposal for 'Garden Landscaping' accepted", description: "Client Musa wants to proceed. Awaiting funding.", timestamp: new Date(Date.now() - 86400000 * 0.5), read: false, link: "/dashboard/services/my-offers" },
  { id: "notif5", userId: "user123", type: "system_update", icon: "Settings", title: "Platform Maintenance Scheduled", description: "Zelo will undergo scheduled maintenance on July 15th, 2 AM - 4 AM WAT.", timestamp: new Date(Date.now() - 86400000 * 5), read: true },
];

const iconMap: Record<NotificationItem['type'], LucideIconName> = {
    new_message: "MessageSquare",
    job_awarded: "Award",
    proposal_accepted: "Briefcase",
    proposal_rejected: "Briefcase",
    payment_received: "DollarSign",
    job_completed_by_artisan: "Check",
    job_confirmed_by_client: "Check",
    new_review: "Award", // Using Award for review, consider Star if available
    system_update: "Settings",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        icon={Bell}
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
                const IconComponent = iconMap[notif.type] || Bell;
                const content = (
                  <div className={cn("flex items-start gap-4 p-4 rounded-lg border transition-colors", 
                                    notif.read ? "bg-card hover:bg-secondary/50" : "bg-primary/5 font-medium border-primary/20 hover:bg-primary/10"
                                  )}>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shrink-0 mt-1", notif.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={cn("text-sm", notif.read ? "text-foreground" : "text-primary-foreground")}>{notif.title}</h4>
                        {!notif.read && <Badge variant="default" className="h-2 w-2 p-0 rounded-full shrink-0" title="Unread" />}
                      </div>
                      {notif.description && <p className="text-xs text-muted-foreground">{notif.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.read && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notif.id); }} className="text-xs self-start">
                        Mark Read
                      </Button>
                    )}
                  </div>
                );

                return (
                  <li key={notif.id}>
                    {notif.link ? (
                      <Link href={notif.link} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-foreground">No notifications yet.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll let you know when there's something new for you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
