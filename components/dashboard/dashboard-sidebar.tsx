"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, User, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { DASHBOARD_NAV, type NavItem } from "@/src/lib/constants";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService } from "@/src/services/auth.service";
import type { Profile } from "@/src/types/database";
import { DashboardSwitches } from "@/components/dashboard/dashboard-switches";

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isOpen: boolean;
  t: (key: string) => string;
  onToggle: () => void;
  toggleSubmenu: (title: string) => void;
  handleNavClick: (item: NavItem, e: React.MouseEvent) => void;
  setOpenMenu: (title: string | null) => void;
  onMobileClose?: () => void;
}

function SidebarNavItem({
  item,
  collapsed,
  isActive,
  isOpen,
  t,
  onToggle,
  toggleSubmenu,
  handleNavClick,
  setOpenMenu,
  onMobileClose,
}: SidebarNavItemProps) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = !!item.children;
  const translatedTitle = t(`sidebar.${item.title}`);

  const triggerElement = hasChildren ? (
    <button
      onPointerDown={(e) => e.preventDefault()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (collapsed) {
          onToggle(); // Open sidebar
          setOpenMenu(item.title); // Show submenu
        } else {
          toggleSubmenu(item.title);
        }
      }}
      className={cn(
        "flex items-center justify-start! rounded-lg font-medium transition-all duration-300 cursor-pointer w-full px-4 py-3 text-[15px] gap-3.5 lg:text-sm lg:h-10 lg:transition-all lg:duration-300",
        collapsed ? "lg:w-10 lg:pl-2.5 lg:pr-2.5 lg:gap-0" : "lg:w-full lg:pl-2.5 lg:pr-3 lg:py-2.5 lg:gap-3",
        isActive(item.href)
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100 active:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/10 dark:active:text-white"
      )}
    >
      <item.icon className="shrink-0 h-5 w-5 max-lg:h-[22px] max-lg:w-[22px]" />
      <span className={cn(
        "inline-block text-left! transition-all duration-200 origin-left whitespace-nowrap overflow-hidden text-ellipsis",
        collapsed
          ? "lg:w-0 lg:max-w-0 lg:opacity-0 lg:-translate-x-4 lg:pointer-events-none lg:flex-none"
          : "flex-1 max-w-[200px] opacity-100 translate-x-0"
      )}>
        {translatedTitle}
      </span>
      <ChevronRight
        className={cn(
          "shrink-0 transition-all duration-200 origin-center ml-auto",
          isOpen && "rotate-90",
          collapsed
            ? "lg:w-0 lg:h-0 lg:opacity-0 lg:pointer-events-none lg:flex-none"
            : "opacity-100 h-4 w-4 max-lg:h-5 max-lg:w-5"
        )}
      />
    </button>
  ) : (
    <Link
      href={item.disabled ? "#" : item.href}
      onPointerDown={(e) => e.preventDefault()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => handleNavClick(item, e)}
      className={cn(
        "flex items-center justify-start! rounded-lg font-medium transition-all duration-300 w-full px-4 py-3 text-[15px] gap-3.5 lg:text-sm lg:h-10 lg:transition-all lg:duration-300",
        item.disabled && "opacity-50 cursor-not-allowed",
        collapsed ? "lg:w-10 lg:pl-2.5 lg:pr-2.5 lg:gap-0" : "lg:w-full lg:pl-2.5 lg:pr-3 lg:py-2.5 lg:gap-3",
        isActive(item.href)
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100 active:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/10 dark:active:text-white"
      )}
    >
      <item.icon className="shrink-0 h-5 w-5 max-lg:h-[22px] max-lg:w-[22px]" />
      <span className={cn(
        "inline-block text-left! transition-all duration-200 origin-left whitespace-nowrap overflow-hidden text-ellipsis",
        collapsed
          ? "lg:w-0 lg:max-w-0 lg:opacity-0 lg:-translate-x-4 lg:pointer-events-none lg:flex-none"
          : "flex-1 max-w-[200px] opacity-100 translate-x-0"
      )}>
        {translatedTitle}
      </span>
    </Link>
  );

  return (
    <li className="flex flex-col items-start w-full">
      <Tooltip open={collapsed && hovered}>
        <TooltipTrigger asChild>
          {triggerElement}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{translatedTitle}</p>
        </TooltipContent>
      </Tooltip>

      {/* Submenu */}
      {!collapsed && isOpen && hasChildren && (
        <ul className="ml-4 mt-1 border-l border-neutral-200 pl-4 dark:border-white/10 w-full space-y-0.5 max-lg:space-y-1">
          {item.children?.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => {
                  onMobileClose?.();
                }}
                className={cn(
                  "block rounded-md transition-colors px-3 py-2 text-sm max-lg:px-4 max-lg:py-2.5 max-lg:text-[14px]",
                  isActive(child.href)
                    ? "font-medium text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white"
                )}
              >
                {t(`sidebar.${child.title}`)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Dashboard sidebar with navigation menu and collapsible submenus.
 * Features glassmorphism border and responsive visibility/translations.
 */
export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));

    const handleProfileUpdate = () => {
      setLoading(true);
      AuthService.getProfile()
        .then((updatedProfile) => {
          if (updatedProfile) {
            setProfile(updatedProfile);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    window.addEventListener("profile-update", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-update", handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push("/login");
    } catch {
      // Ignore
    }
  };

  const toggleSubmenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/admin/dashboard";
    return pathname.startsWith(href) || pathname.startsWith(`/admin${href}`);
  };

  useEffect(() => {
    const activeParent = DASHBOARD_NAV.find((item) => {
      if (item.children) {
        return item.children.some((child) => isActive(child.href));
      }
      return false;
    });

    if (activeParent) {
      setOpenMenu(activeParent.title);
    }
  }, [pathname]);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      toast.info(t("common.coming_soon"), {
        description: t("common.coming_soon_desc"),
      });
    } else {
      setOpenMenu(null);
      onMobileClose?.();
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex h-[calc(100vh-56px)] flex-col border-r border-neutral-200/60 bg-white/90 backdrop-blur-xl transition-all duration-300 overflow-x-hidden",
          "dark:border-white/10 dark:bg-neutral-950/90",
          "fixed top-14 z-45",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          "w-[260px] max-lg:left-0 max-lg:transition-transform max-lg:duration-300",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 max-lg:py-6">
          <ul className="space-y-2 max-lg:space-y-2.5">
            {DASHBOARD_NAV.map((item) => {
              const isOpen = openMenu === item.title;

              return (
                <SidebarNavItem
                  key={item.title}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive}
                  isOpen={isOpen}
                  t={t}
                  onToggle={onToggle}
                  toggleSubmenu={toggleSubmenu}
                  handleNavClick={handleNavClick}
                  setOpenMenu={setOpenMenu}
                  onMobileClose={onMobileClose}
                />
              );
            })}
          </ul>
        </nav>

        {/* Profile Footer Section */}
        {!collapsed && (
          <div className="px-4 pb-4 pt-2 shrink-0 animate-in fade-in duration-300">
            {loading ? (
              <div className="flex items-center p-2 gap-3 w-full">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 flex flex-col space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded animate-pulse" />
                  <Skeleton className="h-3 w-28 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center w-full text-left rounded-lg hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-white/10 dark:active:bg-white/10 transition-colors cursor-pointer outline-none focus:outline-none p-2 gap-3">
                    {/* Avatar */}
                    <Avatar className="h-9 w-9 border border-neutral-200 dark:border-white/10 rounded-lg shrink-0">
                      <AvatarImage
                        src={profile?.photo_url || undefined}
                        alt={profile?.full_name || "FB"}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg flex items-center justify-center text-sm font-semibold">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Profile details */}
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {profile?.full_name || "Admin"}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {profile?.email || ""}
                        </p>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500 shrink-0 ml-2" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={12}
                  className="w-60 p-1.5"
                >
                  {/* Theme & Language Switch */}
                  <div className="px-1 py-1">
                    <DashboardSwitches />
                  </div>

                  <div className="-mx-1.5 border-t border-neutral-200/60 dark:border-white/10 my-1" />

                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/dashboard/profile");
                      onMobileClose?.();
                    }}
                    className="cursor-pointer py-2 px-2.5"
                  >
                    <User className="mr-2 h-4 w-4 text-neutral-500" />
                    {t("header.my_profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    className="cursor-pointer py-2 px-2.5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
