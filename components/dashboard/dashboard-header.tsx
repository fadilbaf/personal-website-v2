"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/dashboard/language-toggle";
import { useLanguage } from "@/context/language-context";
import { AuthService } from "@/src/services/auth.service";
import type { Profile } from "@/src/types/database";
import { cn } from "@/src/app/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

interface ProfileDropdownProps {
  profile: Profile | null;
  showSkeleton: boolean;
  handleLogout: () => void;
  router: any;
  t: any;
  align: "start" | "end";
}

function ProfileDropdown({
  profile,
  showSkeleton,
  handleLogout,
  router,
  t,
  align,
}: ProfileDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  const actualShowSkeleton = showSkeleton || (profile?.photo_url ? (imageStatus !== "loaded" && imageStatus !== "error") : false);

  return (
    <Tooltip
      open={dropdownOpen ? false : tooltipOpen}
      onOpenChange={setTooltipOpen}
    >
      <DropdownMenu onOpenChange={setDropdownOpen}>
        <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={actualShowSkeleton}
              onClick={(e) => {
                if (!actualShowSkeleton) {
                  setTooltipOpen(false);
                  e.currentTarget.blur();
                }
              }}
              className={cn(
                "h-9 w-9 rounded-lg p-0 border border-neutral-200 dark:border-white/10 hover:bg-transparent active:bg-neutral-100 dark:active:bg-white/10 active:scale-100 focus:ring-0 focus-visible:ring-0 relative overflow-hidden cursor-pointer",
                actualShowSkeleton && "pointer-events-none cursor-default"
              )}
            >
              <Avatar className={cn("h-full w-full", actualShowSkeleton && "invisible")}>
                <AvatarImage
                  src={profile?.photo_url || undefined}
                  alt={profile?.full_name || "FB"}
                  className="rounded-lg"
                  onLoadingStatusChange={setImageStatus}
                />
                <AvatarFallback className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {actualShowSkeleton && (
                <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent
          align={align}
          className="w-48"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-xs text-neutral-500 font-normal">
                {profile?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/profile");
              setTooltipOpen(false);
            }}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            {t("header.my_profile")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("header.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent side="bottom">
        <p>{t("header.profile")}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
  mobileOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

/**
 * Dashboard header with glassmorphism background.
 * Contains: mobile menu toggle, language toggle, theme toggle, and user profile dropdown.
 */
export function DashboardHeader({
  sidebarCollapsed,
  onToggleSidebar,
  mobileOpen,
  onToggleMobileSidebar,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getProfile()
      .then(setProfile)
      .catch(() => { })
      .finally(() => setLoading(false));

    const handleProfileUpdate = () => {
      setLoading(true);
      AuthService.getProfile()
        .then((updatedProfile) => {
          if (updatedProfile) {
            setProfile(updatedProfile);
          }
        })
        .catch(() => { })
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
      // Ignore logout errors
    }
  };

  return (
    <TooltipProvider>
      <header
        className="fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200/60 bg-white/70 pl-3.5 pr-[calc(0.875rem+var(--removed-body-scroll-bar-size,0px))] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-neutral-950/70"
      >
        {/* Left Side: Mobile/Desktop Toggle and Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileSidebar}
              className="h-9 w-9 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 active:text-white hover:text-white transition-colors duration-200 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 dark:active:text-neutral-900 dark:hover:text-neutral-900 rounded-lg flex items-center justify-center cursor-pointer border-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0"
            >
              <div className="relative w-[18px] h-[14px] flex flex-col justify-between items-center">
                <span className="w-full h-[2px] bg-current rounded-full" />
                <span className="w-full h-[2px] bg-current rounded-full" />
                <span className="w-full h-[2px] bg-current rounded-full" />
              </div>
            </Button>
          </div>

          {/* Desktop Sidebar Toggle */}
          <div className="hidden lg:block">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    onToggleSidebar?.();
                    e.currentTarget.blur();
                  }}
                  className="h-9 w-9 bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 active:text-white hover:text-white transition-colors duration-200 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 dark:active:text-neutral-900 dark:hover:text-neutral-900 rounded-lg flex items-center justify-center cursor-pointer border-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                >
                  <div className="relative w-[18px] h-[14px] flex flex-col justify-between items-center">
                    <span className="w-full h-[2px] bg-current rounded-full" />
                    <span className="w-full h-[2px] bg-current rounded-full" />
                    <span className="w-full h-[2px] bg-current rounded-full" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{sidebarCollapsed ? t("header.expand") : t("header.collapse")}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Brand Logo */}
          <Link
            href="/dashboard"
            onClick={(e) => {
              if (pathname === "/dashboard") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="relative flex items-center h-7"
          >
            <img
              src={logoBlack.src}
              alt="Fadil Bafagih"
              className="dark:hidden h-7 w-auto"
            />
            <img
              src={logoWhite.src}
              alt="Fadil Bafagih"
              className="hidden dark:block h-7 w-auto"
            />
          </Link>
        </div>

        {/* Right side: Language, Theme, and Profile dropdown */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />

          {/* User Profile dropdown */}
          <ProfileDropdown
            profile={profile}
            showSkeleton={loading}
            handleLogout={handleLogout}
            router={router}
            t={t}
            align="end"
          />
        </div>
      </header>
    </TooltipProvider>
  );
}
