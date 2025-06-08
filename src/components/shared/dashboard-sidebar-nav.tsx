
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
  useSidebar,
} from "@/components/ui/sidebar";
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
  FileText,
  Search, 
  ClipboardList, 
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
  Search, 
  ClipboardList, 
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
        
        // Determine if item is active
        let isActive = item.href === pathname;
        if (!isActive && item.href && item.href !== "/dashboard" && pathname.startsWith(item.href)) {
          isActive = true; // Parent active if child route is active
        }
        if (item.href === "/dashboard" && pathname === "/dashboard") {
            isActive = true; // Specific check for main dashboard link
        }
        
        if (item.children && item.children.length > 0) {
          // Check if any child is active to make parent active
          const isChildPathActive = item.children.some(child => pathname === child.href || (child.href && pathname.startsWith(child.href) && child.href !== item.href));
          const isParentGroupActive = isActive || isChildPathActive;

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
                isActive={isParentGroupActive}
                className="justify-between"
                aria-expanded={isParentGroupActive ? "true" : "false"}
              >
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent />}
                  <span>{item.title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isParentGroupActive && "rotate-180")} />
              </SidebarMenuButton>
              <SidebarMenuSub style={{ display: isParentGroupActive ? 'block' : 'none' }}>
                {item.children.map((child, childIndex) => {
                  const ChildIconComponent = child.icon ? iconComponentsMap[child.icon] : null;
                  const isChildActive = pathname === child.href || (child.href && pathname.startsWith(child.href) && child.href.length > (item.href?.length || 0) );
                  return (
                    <SidebarMenuSubItem key={childIndex}>
                      <Link href={child.href} asChild>
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
            <Link href={item.href}>
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
