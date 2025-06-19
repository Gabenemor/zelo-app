
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, SlidersHorizontal, Eye, Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import type { User, UserRole } from "@/types";
import { format } from 'date-fns';
import { getAllUsers, updateUser } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminUserManagementPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<User['status'] | "all">("all");
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersFromDb = await getAllUsers();
      setAllUsers(usersFromDb);
      setFilteredUsers(usersFromDb); 
    } catch (error) {
      console.error("Error fetching users for admin panel:", error);
      toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let tempUsers = allUsers;
    if (searchTerm) {
      tempUsers = tempUsers.filter(user =>
        (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      tempUsers = tempUsers.filter(user => user.role === roleFilter);
    }
    if (statusFilter !== "all") {
      tempUsers = tempUsers.filter(user => user.status === statusFilter);
    }
    setFilteredUsers(tempUsers);
  }, [searchTerm, roleFilter, statusFilter, allUsers]);

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await updateUser(userId, { status: newStatus });
      toast({ title: "User Status Updated", description: `User ${userId} status changed to ${newStatus}.` });
      fetchUsers(); 
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title="User Management" description="Loading users..." />
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Oversee and manage all users on the Zelo platform." />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Platform Users</CardTitle>
          <CardDescription>Search, filter, and manage user accounts.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or ID..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]"><SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="client">Clients</SelectItem><SelectItem value="artisan">Artisans</SelectItem><SelectItem value="admin">Admins</SelectItem></SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as User['status'] | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]"><SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="deactivated">Deactivated</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <img src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.fullName?.[0]?.toUpperCase() || 'U'}`} alt={user.fullName || 'User'} className="h-8 w-8 rounded-full object-cover" data-ai-hint="profile avatar" />
                       {user.fullName || user.id}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'artisan' ? 'secondary' : 'outline'} className="capitalize">{user.role}</Badge></TableCell>
                    <TableCell><Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'outline' : 'destructive'} className={`capitalize ${user.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-400' : user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-400' : 'bg-red-500/20 text-red-700 border-red-400'}`}>{user.status}</Badge></TableCell>
                    <TableCell>{user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="icon" title="View Profile">
                        <Link href={user.role === 'artisan' ? `/dashboard/artisans/${user.id}?role=admin` : `/dashboard/profile?userId=${user.id}&role=${user.role}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                       {user.status === 'active' && (<Button variant="ghost" size="icon" title="Suspend User" onClick={() => handleStatusChange(user.id, 'suspended')}><UserX className="h-4 w-4 text-orange-600" /></Button>)}
                       {user.status === 'suspended' && (<Button variant="ghost" size="icon" title="Reactivate User" onClick={() => handleStatusChange(user.id, 'active')}><UserCheck className="h-4 w-4 text-green-600" /></Button>)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No users found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Skeleton = ({ className }: { className: string }) => <div className={`bg-muted animate-pulse rounded ${className}`} />;
