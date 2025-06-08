
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, UserRole, LucideIconName } from "@/types";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  // SidebarGroup, // Not used, can remove if not needed elsewhere
  // SidebarGroupLabel, // Not used
  // SidebarSeparator, // Not used
  useSidebar,
} from "@/components/ui/sidebar"; // Ensure this path is correct
import {
  ChevronDown,
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
import React from "react";

interface DashboardSidebarNavProps {
  items: NavItem[];
  userRole: UserRole; // Pass current user's role
}

// Map of icon names to actual Lucide components
const iconComponentsMap: Record<LucideIconName, React.ElementType> = {
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
  FileText,
};

export function DashboardSidebarNav({ items, userRole }: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const { open, isMobile, setOpenMobile } = useSidebar();

  // Filter items based on user role
  const accessibleItems = items.filter(item =>
    !item.roles || item.roles.includes(userRole)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => !child.roles || child.roles.includes(userRole))
  }));


  if (!accessibleItems.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {accessibleItems.map((item, index) => {
        const IconComponent = item.icon ? iconComponentsMap[item.icon] : null;
        const isActive = item.href === pathname || (item.href !== "/dashboard" && item.children && pathname.startsWith(item.href)) || (item.href === "/dashboard" && pathname === "/dashboard");
        
        if (item.children && item.children.length > 0) {
          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                onClick={(e) => {
                  const currentTarget = e.currentTarget;
                  const subMenu = currentTarget.nextElementSibling as HTMLElement | null;
                  if (subMenu) {
                    const isCurrentlyOpen = subMenu.style.display !== 'none';
                    subMenu.style.display = isCurrentlyOpen ? 'none' : 'block';
                    currentTarget.setAttribute('aria-expanded', String(!isCurrentlyOpen));
                  }
                }}
                isActive={isActive}
                className="justify-between"
                aria-expanded={isActive ? "true" : "false"}
              >
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent />}
                  <span>{item.title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isActive && "rotate-180")} />
              </SidebarMenuButton>
              <SidebarMenuSub style={{ display: isActive ? 'block' : 'none' }}>
                {item.children.map((child, childIndex) => {
                  const ChildIconComponent = child.icon ? iconComponentsMap[child.icon] : null;
                  const isChildActive = pathname === child.href;
                  return (
                    <SidebarMenuSubItem key={childIndex}>
                      <Link href={child.href} legacyBehavior passHref>
                        <SidebarMenuSubButton
                          isActive={isChildActive}
                          onClick={() => { if (isMobile) setOpenMobile(false);}}
                        >
                          {ChildIconComponent && <ChildIconComponent />}
                          <span>{child.title}</span>
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={index}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={open ? undefined : item.title}
                onClick={() => { if (isMobile) setOpenMobile(false);}}
              >
                {IconComponent && <IconComponent />}
                <span>{item.title}</span>
                {item.label && <span className="ml-auto text-xs">{item.label}</span>}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
