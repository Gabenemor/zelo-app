
import type { NavItem, UserRole, LucideIconName } from "@/types";
// We don't need to import the actual icon components here anymore for the NavItem definition.
// They will be resolved in the DashboardSidebarNav component.

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
    icon: "LayoutDashboard" as LucideIconName,
    roles: commonRoles,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: "UserCircle" as LucideIconName,
    roles: commonRoles,
    children: [
       { title: "Edit My Profile", href: "/dashboard/profile/edit", icon: "Settings" as LucideIconName, roles: commonRoles },
       { title: "Withdrawal Settings", href: "/dashboard/profile/withdrawal-settings", icon: "CreditCard" as LucideIconName, roles: artisanOnly },
    ]
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: "Briefcase" as LucideIconName,
    roles: commonRoles,
    children: [
      { title: "Browse Services", href: "/dashboard/services/browse", icon: "MapPin" as LucideIconName, roles: commonRoles },
      { title: "Post a Request", href: "/dashboard/services/request/new", icon: "PlusCircle" as LucideIconName, roles: clientOnly },
      { title: "My Service Requests", href: "/dashboard/services/my-requests", icon: "FileText" as LucideIconName, roles: clientOnly },
      { title: "My Offered Services", href: "/dashboard/services/my-offers", icon: "FileText" as LucideIconName, roles: artisanOnly },
    ],
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: "MessageSquare" as LucideIconName,
    label: "3", // Example badge
    roles: commonRoles,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: "ShieldCheck" as LucideIconName,
    roles: commonRoles,
    children: [
        { title: "My Escrow Transactions", href: "/dashboard/payments/escrow", icon: "ShieldCheck" as LucideIconName, roles: commonRoles },
        { title: "Transaction History", href: "/dashboard/payments/history", icon: "FileText" as LucideIconName, roles: commonRoles },
    ]
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: "Users" as LucideIconName,
    roles: adminOnly,
    children: [
        { title: "Manage Users", href: "/dashboard/admin/users", icon: "Users" as LucideIconName, roles: adminOnly },
        { title: "Manage Services", href: "/dashboard/admin/services", icon: "Briefcase" as LucideIconName, roles: adminOnly },
        { title: "Platform Settings", href: "/dashboard/admin/settings", icon: "Settings" as LucideIconName, roles: adminOnly },
    ]
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings" as LucideIconName,
    roles: commonRoles,
  },
  {
    title: "Logout",
    href: "/logout", // This would typically trigger a logout function
    icon: "LogOut" as LucideIconName,
    roles: commonRoles,
  },
];
