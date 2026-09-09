"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/src/app/lib/utils";

interface OverviewStatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}

/**
 * Enhanced stat card for the dashboard overview row.
 * Features animated counter, glassmorphism, and subtle hover lift.
 */
export function OverviewStatCard({
  title,
  value,
  icon: Icon,
  loading,
  className,
}: OverviewStatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
        "dark:border-white/10 dark:bg-neutral-900/80 dark:hover:shadow-white/5",
        className
      )}
    >
      {/* Subtle gradient accent on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-neutral-100/0 to-neutral-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/0 dark:to-white/5" />

      <CardContent className="relative px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </p>
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {loading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <AnimatedNumber value={value} />
              )}
            </div>
          </div>
          <div className="rounded-xl bg-neutral-100 p-3 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-white/10 dark:group-hover:bg-white dark:group-hover:text-neutral-900">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
