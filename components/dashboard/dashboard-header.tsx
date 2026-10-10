"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronsUpDown } from "lucide-react";
import { DashboardSwitches } from "@/components/dashboard/dashboard-switches";
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
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  const actualShowSkeleton = showSkeleton || (profile?.photo_url ? (imageStatus !== "loaded" && imageStatus !== "error") : false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={showSkeleton}
          className={cn(
            "flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-white/10 dark:active:bg-white/10 transition-colors cursor-pointer outline-none focus:outline-none",
            showSkeleton && "pointer-events-none cursor-default"
          )}
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <Avatar className={cn("h-8 w-8 border border-neutral-200/60 dark:border-white/10 rounded-lg", actualShowSkeleton && "invisible")}>
              <AvatarImage
                src={profile?.photo_url || undefined}
                alt={profile?.full_name || "FB"}
                className="rounded-lg object-cover"
                onLoadingStatusChange={setImageStatus}
              />
              <AvatarFallback className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg flex items-center justify-center text-xs font-semibold">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            {actualShowSkeleton && (
              <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
            )}
          </div>

          {/* Profile Name & Email */}
          <div className="flex flex-col text-left min-w-0 max-w-[110px] sm:max-w-[160px] md:max-w-[200px]">
            {showSkeleton ? (
              <div className="space-y-1 py-0.5">
                <Skeleton className="h-3 w-16 sm:w-20 rounded" />
                <Skeleton className="h-2.5 w-20 sm:w-28 rounded" />
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate leading-tight">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-[10px] sm:text-xs text-neutral-500 truncate leading-tight mt-0.5">
                  {profile?.email || ""}
                </p>
              </>
            )}
          </div>

          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-56 p-1.5"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Theme & Language Switch */}
        <div className="px-1 py-1">
          <DashboardSwitches />
        </div>

        <div className="-mx-1.5 border-t border-neutral-200/60 dark:border-white/10 my-1" />

        <DropdownMenuItem
          onClick={() => {
            router.push("/dashboard/profile");
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
        className="fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200/60 bg-white/70 px-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70"
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
        </div>

        {/* Right side: Profile dropdown */}
        <div className="flex items-center gap-2">
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
