"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"; // Ensure this path is correct
import { ChevronDown } from "lucide-react";
import React from "react";

interface DashboardSidebarNavProps {
  items: NavItem[];
  userRole: UserRole; // Pass current user's role
}

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
        const Icon = item.icon;
        const isActive = item.href === pathname || (item.children && pathname.startsWith(item.href));
        
        if (item.children && item.children.length > 0) {
          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                onClick={(e) => {
                  // Basic accordion toggle for sidebar items with children
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
                  {Icon && <Icon />}
                  <span>{item.title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isActive && "rotate-180")} />
              </SidebarMenuButton>
              <SidebarMenuSub style={{ display: isActive ? 'block' : 'none' }}>
                {item.children.map((child, childIndex) => {
                  const ChildIcon = child.icon;
                  const isChildActive = pathname === child.href;
                  return (
                    <SidebarMenuSubItem key={childIndex}>
                      <Link href={child.href} legacyBehavior passHref>
                        <SidebarMenuSubButton 
                          isActive={isChildActive} 
                          onClick={() => { if (isMobile) setOpenMobile(false);}}
                        >
                          {ChildIcon && <ChildIcon />}
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
                {Icon && <Icon />}
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
