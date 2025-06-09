

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
  username?: string;
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
  onboardingCompleted?: boolean;
}

export interface ClientProfile {
  userId: string;
  username?: string;
  contactPhone?: string;
  location?: string; // General location
  locationCoordinates?: { lat: number; lng: number }; // For geospatial data
  isLocationPublic?: boolean; // User's preference to share exact location
  onboardingCompleted?: boolean;
  servicesLookingFor?: string[];
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
  postedBy?: { 
    name: string;
    avatarUrl?: string;
    memberSince?: string;
    email?: string; 
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
  attachments?: Array<{ name: string; url: string; type: 'image' | 'document' }>; 
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
  | "Search" 
  | "ClipboardList"
  | "HeartHandshake" // For client onboarding step 1
  | "UserCog" // For client onboarding step 2
  | "Wrench" // For artisan onboarding step 1
  | "UserCircle2"; // For artisan onboarding step 2


export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIconName;
  disabled?: boolean;
  external?: boolean;
  label?: string; 
  children?: NavItem[]; 
  roles?: UserRole[]; 
}

// Centralized list of services
export const NIGERIAN_ARTISAN_SERVICES = [
  "Tailoring/Fashion Design", "Plumbing", "Electrical Services", "Carpentry", 
  "Hairdressing/Barbing", "Makeup Artistry", "Catering", "Event Planning", 
  "Photography/Videography", "Graphic Design", "Web Development", "Appliance Repair",
  "AC Repair & Installation", "Generator Repair", "Welding/Fabrication", "Painting",
  "Tiling", "POP Ceiling Installation", "Car Mechanic", "Home Cleaning", "Other"
];
