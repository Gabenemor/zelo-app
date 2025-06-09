
import type { NavItem, UserRole, LucideIconName } from "@/types";

export const siteConfig = {
  name: "Zelo",
  description: "Connect with skilled artisans in Nigeria. Effortlessly.",
  url: "https://zelo.app", // Replace with actual URL
  ogImage: "https://zelo.app/og.jpg", // Replace with actual OG image
  links: {
    twitter: "https://twitter.com/zeloapp", // Replace
    github: "https://github.com/yourorg/zelo", // Replace
  },
};

const commonRoles: UserRole[] = ["client", "artisan", "admin"];
const artisanOnly: UserRole[] = ["artisan", "admin"];
const clientOnly: UserRole[] = ["client", "admin"];
const adminOnly: UserRole[] = ["admin"];


export const dashboardNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: commonRoles,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: "UserCircle",
    roles: commonRoles,
    children: [
       { title: "View My Profile", href: "/dashboard/profile", roles: commonRoles },
       { title: "Edit My Profile", href: "/dashboard/profile/edit", roles: commonRoles },
       { title: "Edit Primary Services", href: "/dashboard/profile/artisan/services/edit", icon: "Briefcase", roles: artisanOnly },
       { title: "Withdrawal Settings", href: "/dashboard/profile/withdrawal-settings", icon: "CreditCard", roles: artisanOnly },
    ]
  },
  // Client-specific section (will be filtered out for artisans by role check in header)
  {
    title: "Find Services",
    href: "/dashboard/services/browse", // Main entry point for clients
    icon: "Search", // Changed icon to reflect searching
    roles: clientOnly,
    children: [
      { title: "Browse Artisans", href: "/dashboard/services/browse", roles: clientOnly },
      { title: "Post a Request", href: "/dashboard/services/request/new", roles: clientOnly },
      { title: "My Service Requests", href: "/dashboard/services/my-requests", roles: clientOnly },
    ],
  },
  // Artisan-specific section
  {
    title: "Artisan Hub",
    href: "/dashboard/jobs", // Main entry point for artisans to find jobs
    icon: "Briefcase", // Changed icon for artisan hub
    roles: artisanOnly,
    children: [
        { title: "Find New Jobs", href: "/dashboard/jobs", roles: artisanOnly },
        { title: "My Jobs & Proposals", href: "/dashboard/services/my-offers", roles: artisanOnly },
    ]
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: "MessageSquare",
    label: "3", // Example badge
    roles: commonRoles,
  },
  {
    title: "Payments",
    href: "/dashboard/payments", 
    icon: "CreditCard",
    roles: commonRoles,
    children: [
        { title: "Payments Overview", href: "/dashboard/payments", roles: commonRoles }, 
        { title: "Escrow Details", href: "/dashboard/payments/escrow", roles: commonRoles },
        { title: "Transaction History", href: "/dashboard/payments/history", roles: commonRoles },
    ]
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: "Users", // Or Shield for admin
    roles: adminOnly,
    children: [
        { title: "User Management", href: "/dashboard/admin/users", roles: adminOnly },
        { title: "Service Categories", href: "/dashboard/admin/services", roles: adminOnly }, // Example
        { title: "Platform Settings", href: "/dashboard/admin/settings", roles: adminOnly },
    ]
  },
];
