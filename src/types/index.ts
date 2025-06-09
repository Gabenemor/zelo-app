
export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface ArtisanProfile {
  userId: string;
  contactPhone?: string;
  contactEmail?: string;
  servicesOffered: string[]; // Array of service names or IDs
  serviceChargeDescription?: string; // e.g., "per hour", "per project"
  serviceChargeAmount?: number; // in Naira
  location?: string; // General location, e.g., "Lagos, Nigeria"
  locationCoordinates?: { lat: number; lng: number }; // For geospatial data
  isLocationPublic?: boolean; // User's preference to share exact location
  bio?: string;
  portfolioImageUrls?: string[];
  yearsOfExperience?: number;
  availability?: string; // e.g., "Weekdays", "Weekends", "Full-time"
}

export interface ClientProfile {
  userId: string;
  contactPhone?: string;
  location?: string; // General location
  locationCoordinates?: { lat: number; lng: number }; // For geospatial data
  isLocationPublic?: boolean; // User's preference to share exact location
}

export interface WithdrawalAccount {
  userId: string; // Artisan's user ID
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified?: boolean;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  postedBy?: { // Added to simulate client info on request details
    name: string;
    avatarUrl?: string;
    memberSince?: string;
    email?: string; // Added for Paystack integration
  };
  title: string;
  description: string;
  category: string; // Service category
  location: string; // Specific job location
  locationCoordinates?: { lat: number; lng: number }; // For geospatial data
  budget?: number; // Optional, in Naira
  postedAt: Date;
  status: "open" | "in_progress" | "completed" | "cancelled" | "awarded";
  assignedArtisanId?: string;
  attachments?: Array<{ name: string; url: string; type: 'image' | 'document' }>; // For file attachments
}

export interface ArtisanProposal {
  id: string;
  serviceRequestId: string;
  artisanId: string;
  artisanName: string;
  artisanAvatarUrl?: string;
  proposedAmount: number;
  coverLetter: string;
  submittedAt: Date;
  status: "pending" | "accepted" | "rejected";
}


export interface ChatMessage {
  id: string;
  chatId: string; // Conversation ID
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead?: boolean;
  googleMeetLink?: string; // Optional link
}

export interface EscrowTransaction {
  id: string;
  serviceRequestId: string;
  clientId: string;
  artisanId: string;
  amount: number; // Total amount in Naira
  platformFee: number; // 10% of amount
  status: "funded" | "released_to_artisan" | "refunded_to_client" | "disputed";
  createdAt: Date;
  updatedAt: Date;
}

// Define a type for the names of Lucide icons used in navigation
export type LucideIconName =
  | "LayoutDashboard"
  | "UserCircle"
  | "Briefcase"
  | "MessageSquare"
  | "Settings"
  | "CreditCard"
  | "Users"
  | "LogOut"
  | "MapPin"
  | "PlusCircle"
  | "ShieldCheck"
  | "FileText"
  | "Search" // Added for Find Jobs
  | "ClipboardList"; // Added for My Offers

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIconName;
  disabled?: boolean;
  external?: boolean;
  label?: string; // For badges or additional info
  children?: NavItem[]; // For sub-menus
  roles?: UserRole[]; // Roles that can see this nav item
}
