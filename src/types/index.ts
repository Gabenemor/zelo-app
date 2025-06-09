
export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface ServiceExperience {
  serviceName: string;
  years: number;
  chargeAmount?: number; // Added for per-service charge
  chargeDescription?: string; // Added for per-service charge basis (e.g., "per hour")
}

export interface ArtisanProfile {
  userId: string;
  username?: string;
  contactPhone?: string;
  contactEmail?: string;
  servicesOffered: string[];
  serviceExperiences?: ServiceExperience[]; // Will now contain charge details
  // REMOVED: serviceChargeDescription?: string;
  // REMOVED: serviceChargeAmount?: number;
  location?: string;
  locationCoordinates?: { lat: number; lng: number };
  isLocationPublic?: boolean;
  bio?: string;
  portfolioImageUrls?: string[];
  availability?: string;
  onboardingCompleted?: boolean;
  onboardingStep1Completed?: boolean;
  profileSetupCompleted?: boolean;
}

export interface ClientProfile {
  userId: string;
  username?: string;
  contactPhone?: string;
  location?: string;
  locationCoordinates?: { lat: number; lng: number };
  isLocationPublic?: boolean;
  onboardingCompleted?: boolean;
  servicesLookingFor?: string[];
  onboardingStep1Completed?: boolean;
  profileSetupCompleted?: boolean;
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
  category: string;
  location: string;
  locationCoordinates?: { lat: number; lng: number };
  budget?: number;
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
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead?: boolean;
  googleMeetLink?: string;
}

export interface EscrowTransaction {
  id: string;
  serviceRequestId: string;
  clientId: string;
  artisanId: string;
  amount: number;
  platformFee: number;
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
  | "UserCog"
  | "UserCircle2";


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

export const NIGERIAN_ARTISAN_SERVICES = [
  "Tailoring/Fashion Design", "Plumbing", "Electrical Services", "Carpentry",
  "Hairdressing/Barbing", "Makeup Artistry", "Catering", "Event Planning",
  "Photography/Videography", "Graphic Design", "Web Development", "Appliance Repair",
  "AC Repair & Installation", "Generator Repair", "Welding/Fabrication", "Painting",
  "Tiling", "POP Ceiling Installation", "Car Mechanic", "Home Cleaning", "Other"
] as const;

