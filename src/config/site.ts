import type { NavItem, UserRole } from "@/types";
import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  MessageSquare,
  Settings,
  CreditCard,
  Users,
  LogOut,
  MapPin,
  PlusCircle,
  ShieldCheck,
  FileText
} from "lucide-react";

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
    icon: LayoutDashboard,
    roles: commonRoles,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
    roles: commonRoles,
    children: [
       { title: "Edit My Profile", href: "/dashboard/profile/edit", icon: Settings, roles: commonRoles },
       { title: "Withdrawal Settings", href: "/dashboard/profile/withdrawal-settings", icon: CreditCard, roles: artisanOnly },
    ]
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Briefcase,
    roles: commonRoles,
    children: [
      { title: "Browse Services", href: "/dashboard/services/browse", icon: MapPin, roles: commonRoles },
      { title: "Post a Request", href: "/dashboard/services/request/new", icon: PlusCircle, roles: clientOnly },
      { title: "My Service Requests", href: "/dashboard/services/my-requests", icon: FileText, roles: clientOnly },
      { title: "My Offered Services", href: "/dashboard/services/my-offers", icon: FileText, roles: artisanOnly },
    ],
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    label: "3", // Example badge
    roles: commonRoles,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: ShieldCheck,
    roles: commonRoles,
    children: [
        { title: "My Escrow Transactions", href: "/dashboard/payments/escrow", icon: ShieldCheck, roles: commonRoles },
        { title: "Transaction History", href: "/dashboard/payments/history", icon: FileText, roles: commonRoles },
    ]
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: Users,
    roles: adminOnly,
    children: [
        { title: "Manage Users", href: "/dashboard/admin/users", icon: Users, roles: adminOnly },
        { title: "Manage Services", href: "/dashboard/admin/services", icon: Briefcase, roles: adminOnly },
        { title: "Platform Settings", href: "/dashboard/admin/settings", icon: Settings, roles: adminOnly },
    ]
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: commonRoles,
  },
  {
    title: "Logout",
    href: "/logout", // This would typically trigger a logout function
    icon: LogOut,
    roles: commonRoles,
  },
];
