
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, SlidersHorizontal, Eye, Edit, UserX, UserCheck } from "lucide-react";
import type { User, UserRole } from "@/types";
import { format } from 'date-fns';

// Mock user data
const mockUsers: User[] = [
  { id: "user_admin_001", fullName: "Admin User", email: "admin@zelo.app", role: "admin", createdAt: new Date(2023, 0, 15), status: "active", avatarUrl: "https://placehold.co/40x40.png?text=AU" },
  { id: "user_artisan_001", fullName: "Babatunde Adekunle", email: "b.adekunle@example.com", role: "artisan", createdAt: new Date(2023, 2, 10), status: "active", avatarUrl: "https://placehold.co/40x40.png?text=BA" },
  { id: "user_client_001", fullName: "Chioma Nwosu", email: "chi.nwosu@example.com", role: "client", createdAt: new Date(2023, 3, 22), status: "active", avatarUrl: "https://placehold.co/40x40.png?text=CN" },
  { id: "user_artisan_002", fullName: "Fatima Ibrahim", email: "f.ibrahim@example.com", role: "artisan", createdAt: new Date(2023, 5, 5), status: "suspended", avatarUrl: "https://placehold.co/40x40.png?text=FI" },
  { id: "user_client_002", fullName: "David Okoro", email: "david.okoro@example.com", role: "client", createdAt: new Date(2023, 6, 18), status: "active", avatarUrl: "https://placehold.co/40x40.png?text=DO" },
  { id: "user_client_003", fullName: "Aisha Bello", email: "aisha.b@example.com", role: "client", createdAt: new Date(2024, 0, 30), status: "deactivated", avatarUrl: "https://placehold.co/40x40.png?text=AB" },
];


export default function AdminUserManagementPage() {
  // Placeholder for actual filtering logic
  const users = mockUsers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Oversee and manage all users on the Zelo platform."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Platform Users</CardTitle>
          <CardDescription>Search, filter, and manage user accounts.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or ID..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="artisan">Artisans</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                 <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <img src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.fullName?.[0] || 'U'}`} alt={user.fullName || 'User'} className="h-8 w-8 rounded-full object-cover" data-ai-hint="profile avatar" />
                       {user.fullName || user.id}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'artisan' ? 'secondary' : 'outline'} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge 
                          variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'outline' : 'destructive'} 
                          className={`capitalize ${user.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-400' : user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-400' : 'bg-red-500/20 text-red-700 border-red-400'}`}
                        >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="icon" title="View Profile">
                        {/* Link needs to be dynamic based on user role and ID */}
                        <Link href={user.role === 'artisan' ? `/dashboard/artisans/${user.id}?role=admin` : `/dashboard/profile?role=${user.role}&userId=${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                       {user.status === 'active' && (
                        <Button variant="ghost" size="icon" title="Suspend User" onClick={() => console.log(`Mock suspend user: ${user.id}`)}>
                            <UserX className="h-4 w-4 text-orange-600" />
                        </Button>
                       )}
                       {user.status === 'suspended' && (
                        <Button variant="ghost" size="icon" title="Reactivate User" onClick={() => console.log(`Mock reactivate user: ${user.id}`)}>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                       )}
                      <Button variant="ghost" size="icon" title="Edit User (Placeholder)">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No users found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters or check back later.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
