
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation"; // Added useSearchParams
import React, { useState, Suspense } from "react"; // Added Suspense
import { Bell, Search, UserCircle, Menu, X, ChevronDown, Briefcase, CreditCard, Edit, Loader2 } from "lucide-react";
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

function DashboardHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const roleFromQuery = searchParams.get("role") as UserRole | null;
  // Determine userRole: if admin page, role is admin. Otherwise, check query param, default to artisan.
  const isAdminPage = pathname.startsWith('/dashboard/admin');
  const userRole: UserRole = isAdminPage ? 'admin' : (roleFromQuery && ["client", "artisan"].includes(roleFromQuery) ? roleFromQuery : "artisan");
  
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
    const linkHref = item.href === "/dashboard" && userRole !== "admin" ? `/dashboard?role=${userRole}` : item.href;
    
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
              {item.children.map((child) => {
                const childHrefWithRole = child.href.startsWith("/dashboard") && !child.href.includes("admin") && !child.href.includes("?")
                                        ? `${child.href}?role=${userRole}`
                                        : child.href;
                return (
                <DropdownMenuItem key={child.href} asChild>
                  <Link
                    href={childHrefWithRole}
                    onClick={onClick} 
                    className={cn(
                      "text-sm",
                      pathname === child.href ? "font-semibold text-primary" : ""
                    )}
                  >
                    {child.title}
                  </Link>
                </DropdownMenuItem>
              )})}
            </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        href={linkHref}
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
              {item.children.map((child) => {
                 const childHrefWithRole = child.href.startsWith("/dashboard") && !child.href.includes("admin") && !child.href.includes("?")
                                        ? `${child.href}?role=${userRole}`
                                        : child.href;
                return <NavLink key={child.href} item={{...child, href: childHrefWithRole}} onClick={() => setMobileMenuOpen(false)} />
              })}
            </>
          ) : (
            <NavLink item={item} onClick={() => setMobileMenuOpen(false)} />
          )}
        </div>
      ))}
    </nav>
  );

  const profileMenuDashboardLink = `/dashboard${userRole !== 'admin' ? `?role=${userRole}` : ''}`;


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4"> 
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
        <nav className="hidden flex-shrink-0 items-center gap-1 md:flex lg:gap-2">
          {accessibleItems.map((item) => (
            <NavLink key={item.href || item.title} item={item} />
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
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
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href={`/dashboard/notifications?role=${userRole}`}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Link>
        </Button>
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
              <div className="font-medium">{user.name} ({userRole})</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/profile?role=${userRole}`}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  View My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/profile/edit?role=${userRole}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit My Profile
                </Link>
              </DropdownMenuItem>
              {(userRole === 'artisan' || userRole === 'admin') && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/profile/artisan/services/edit?role=${userRole}`}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Edit Primary Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/profile/withdrawal-settings?role=${userRole}`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Withdrawal Settings
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings?role=${userRole}`}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

export function DashboardHeader() {
  return (
    <Suspense fallback={<DashboardHeaderSkeleton />}>
      <DashboardHeaderContent />
    </Suspense>
  )
}

function DashboardHeaderSkeleton() {
  return (
     <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm sm:px-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 rounded-md bg-muted md:hidden"></div> {/* Mobile Menu Trigger Placeholder */}
        <div className="h-8 w-20 rounded-md bg-muted"></div> {/* Logo Placeholder */}
        <nav className="hidden flex-shrink-0 items-center gap-1 md:flex lg:gap-2">
          <div className="h-6 w-20 rounded-md bg-muted"></div>
          <div className="h-6 w-20 rounded-md bg-muted"></div>
          <div className="h-6 w-20 rounded-md bg-muted"></div>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:block h-9 w-48 rounded-md bg-muted"></div> {/* Search Placeholder */}
        <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Bell Placeholder */}
        <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Profile Placeholder */}
      </div>
    </header>
  );
}

