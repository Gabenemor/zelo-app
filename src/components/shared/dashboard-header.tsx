
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Bell, Search, UserCircle, Menu, X, ChevronDown, Briefcase, CreditCard, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { dashboardNavItems } from "@/config/site";
import type { NavItem, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole: UserRole = "artisan"; 
  const user = { name: "Zelo User", email: "user@zelo.app", avatar: "" }; 

  const accessibleItems = dashboardNavItems
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.roles || child.roles.includes(userRole)
      ),
    }));

  const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
    const isActive = pathname === item.href || (item.href && item.href !== "/dashboard" && pathname.startsWith(item.href));
    
    if (item.children && item.children.length > 0) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-foreground/70",
                "justify-start px-3 py-2 md:px-2 md:py-1"
              )}
            >
              {item.title}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.href} asChild>
                  <Link
                    href={child.href}
                    onClick={onClick} 
                    className={cn(
                      "text-sm",
                      pathname === child.href ? "font-semibold text-primary" : ""
                    )}
                  >
                    {child.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "justify-start", 
          "px-3 py-2 md:px-2 md:py-1", 
          isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
        )}
      >
        {item.title}
        {item.label && (
          <span className="ml-2 rounded-lg bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
            {item.label}
          </span>
        )}
      </Link>
    );
  };
  
  const MobileNavContent = () => (
    <nav className="flex flex-col gap-2 p-4">
      {accessibleItems.map((item) => (
        <div key={item.href || item.title}> 
          {item.children && item.children.length > 0 ? (
            <>
              <h4 className="mb-1 mt-2 px-3 text-sm font-semibold text-foreground/70">{item.title}</h4>
              {item.children.map((child) => (
                <NavLink key={child.href} item={child} onClick={() => setMobileMenuOpen(false)} />
              ))}
            </>
          ) : (
            <NavLink item={item} onClick={() => setMobileMenuOpen(false)} />
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4"> {/* Group for logo and nav */}
        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Logo size="md" />
        {/* Desktop Navigation */}
        <nav className="hidden flex-shrink-0 items-center gap-1 md:flex lg:gap-2">
          {accessibleItems.map((item) => (
            <NavLink key={item.href || item.title} item={item} />
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4"> {/* Group for search, bell, profile */}
        <form className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-full rounded-md bg-secondary pl-8 sm:w-[200px] lg:w-[250px]"
            />
          </div>
        </form>
        <Link href="/dashboard/notifications" passHref legacyBehavior>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <a>
              <Bell className="h-5 w-5" />
              <span className="sr-only">View notifications</span>
            </a>
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                  data-ai-hint="profile avatar"
                />
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  View My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit My Profile
                </Link>
              </DropdownMenuItem>
              {(userRole === 'artisan' || userRole === 'admin') && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile/artisan/services/edit">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Edit Primary Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile/withdrawal-settings">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Withdrawal Settings
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0 sm:w-[320px]">
          <SheetHeader className="border-b p-4">
            <SheetTitle asChild>
                <div className="flex items-center justify-between">
                    <Logo size="md" />
                     <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </SheetClose>
                </div>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)]"> 
            <MobileNavContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </header>
  );
}
