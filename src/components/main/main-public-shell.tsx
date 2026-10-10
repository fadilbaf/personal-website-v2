"use client";

import type { ReactNode } from "react";
import type { Profile, Role, Contact, About, Badge } from "@/src/types/database";
import type { MainLocale } from "@/src/lib/main-translations";
import { MainSidebar } from "@/src/components/main/main-sidebar";
import { MainMobileHeader } from "@/src/components/main/main-mobile-header";
import { NewsletterToast } from "@/src/components/main/newsletter-toast";

interface MainPublicShellProps {
  profile: Profile | null;
  roles: Role[];
  badges?: Badge[];
  contact: Contact | null;
  about: About | null;
  locale: MainLocale;
  children: ReactNode;
}

export function MainPublicShell({
  profile,
  roles,
  badges = [],
  contact,
  about,
  locale,
  children,
}: MainPublicShellProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans transition-colors duration-300 overflow-x-clip">
      {/* Mobile Top Header */}
      <MainMobileHeader
        locale={locale}
        profile={profile}
        roles={roles}
      />

      {/* Balanced Page Container with Sidebar & Content */}
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 md:px-10 lg:px-24 xl:px-32 flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sticky Sidebar */}
        <MainSidebar
          profile={profile}
          roles={roles}
          contact={contact}
          about={about}
          locale={locale}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full pt-14 lg:pt-0 flex flex-col lg:pl-8 xl:pl-10">
          {children}
        </div>
      </div>

      {/* Floating Newsletter Toast/Popup */}
      <NewsletterToast locale={locale} />
    </div>
  );
}
