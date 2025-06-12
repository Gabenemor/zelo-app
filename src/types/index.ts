
export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  status?: 'active' | 'suspended' | 'deactivated'; 
}

export interface ServiceExperience {
  serviceName: string;
  years: number;
  chargeAmount?: number; 
  chargeDescription?: string; 
}

export interface ArtisanProfile {
  userId: string;
  username?: string;
  profilePhotoUrl?: string; 
  headline?: string; 
  contactPhone?: string;
  contactEmail?: string;
  servicesOffered: string[];
  serviceExperiences?: ServiceExperience[]; 
  location?: string;
  locationCoordinates?: { lat: number; lng: number };
  isLocationPublic?: boolean;
  bio?: string;
  portfolioImageUrls?: string[];
  availabilityStatus?: 'available' | 'busy' | 'unavailable'; 
  onboardingCompleted?: boolean;
  onboardingStep1Completed?: boolean;
  profileSetupCompleted?: boolean;
}

export interface ClientProfile {
  userId: string;
  username?: string; 
  avatarUrl?: string; 
  fullName?: string; 
  contactEmail?: string; 
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
  userId: string; 
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified?: boolean;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName?: string; 
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
  status: "open" | "in_progress" | "completed" | "cancelled" | "awarded" | "disputed"; 
  assignedArtisanId?: string;
  assignedArtisanName?: string; 
  attachments?: Array<{ name: string; url: string; type: 'image' | 'document'; "data-ai-hint"?: string }>;
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

export type ActivityType = 
  | 'new_message' 
  | 'request_update' 
  | 'new_proposal' 
  | 'payment_processed' 
  | 'profile_update'
  | 'job_awarded'
  | 'job_completed';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  icon: LucideIconName; 
  title: string;
  description?: string; 
  timestamp: Date;
  link?: string; 
  userId: string; 
}


export type NotificationType =
  | 'new_message'
  | 'job_awarded'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'payment_received'
  | 'job_completed_by_artisan'
  | 'job_confirmed_by_client'
  | 'new_review'
  | 'system_update';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  icon: LucideIconName;
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export interface DisputeItem {
  id: string;
  serviceRequestId: string;
  jobTitle: string;
  clientName: string;
  artisanName: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved_client' | 'resolved_artisan' | 'resolved_compromise';
  createdAt: Date;
  lastUpdatedAt: Date;
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
  | "UserCircle2"
  | "Award" 
  | "CheckCircle2"
  | "Menu"
  | "Camera"
  | "UploadCloud"
  | "CalendarDays" 
  | "Edit"
  | "Bell" 
  | "Check" 
  | "Trash2" 
  | "DollarSign" 
  | "Info"
  | "ListChecks"
  | "ShoppingCart" 
  | "Edit3"
  | "AlertTriangle"
  | "SlidersHorizontal"
  | "Activity"; // Added Activity icon


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

type ServiceName = typeof NIGERIAN_ARTISAN_SERVICES[number];
export type NigerianArtisanService = ServiceName;
