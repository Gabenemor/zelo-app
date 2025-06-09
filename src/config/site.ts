
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
       { title: "Edit My Profile", href: "/dashboard/profile/edit", icon: "Settings", roles: commonRoles },
       { title: "Withdrawal Settings", href: "/dashboard/profile/withdrawal-settings", icon: "CreditCard", roles: artisanOnly },
    ]
  },
  {
    title: "Client Services", // Renamed for clarity
    href: "/dashboard/services",
    icon: "Briefcase",
    roles: clientOnly, // Primarily for clients
    children: [
      { title: "Browse Artisans", href: "/dashboard/services/browse", icon: "MapPin", roles: clientOnly }, // Clients browse artisans
      { title: "Post a Request", href: "/dashboard/services/request/new", icon: "PlusCircle", roles: clientOnly },
      { title: "My Service Requests", href: "/dashboard/services/my-requests", icon: "FileText", roles: clientOnly },
    ],
  },
  {
    title: "Artisan Hub", // New section for artisans
    href: "/dashboard/jobs",
    icon: "Search", // Using 'Search' for "Find Jobs"
    roles: artisanOnly,
    children: [
        { title: "Find Jobs", href: "/dashboard/jobs", icon: "Search", roles: artisanOnly }, // Points to the new browse jobs page
        { title: "My Job Offers", href: "/dashboard/services/my-offers", icon: "ClipboardList", roles: artisanOnly }, // Existing page for artisan's offers
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
    icon: "ShieldCheck",
    roles: commonRoles,
    children: [
        { title: "My Escrow Transactions", href: "/dashboard/payments/escrow", icon: "ShieldCheck", roles: commonRoles },
        { title: "Transaction History", href: "/dashboard/payments/history", icon: "FileText", roles: commonRoles },
    ]
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: "Users",
    roles: adminOnly,
    children: [
        { title: "Manage Users", href: "/dashboard/admin/users", icon: "Users", roles: adminOnly },
        { title: "Manage Services", href: "/dashboard/admin/services", icon: "Briefcase", roles: adminOnly }, // This might need to be "Manage Service Categories" or similar
        { title: "Platform Settings", href: "/dashboard/admin/settings", icon: "Settings", roles: adminOnly },
    ]
  },
  // {
  //   title: "Settings",
  //   href: "/dashboard/settings",
  //   icon: "Settings",
  //   roles: commonRoles,
  // },
  // Logout is handled by the main layout's sidebar footer, so removing from here to avoid duplication if it was just a link.
  // If it's intended to be a separate page/action, it can stay. Let's assume it's handled.
  // {
  //   title: "Logout",
  //   href: "/api/auth/logout", // Example logout link
  //   icon: "LogOut" as LucideIconName,
  //   roles: commonRoles,
  // },
];

// Add new icons to the map in `dashboard-sidebar-nav.tsx` if they are not already there:
// Search, ClipboardList
// Make sure they are also added to LucideIconName in types/index.ts
