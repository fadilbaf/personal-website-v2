"use client";

import { cn } from "@/src/app/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  loading?: boolean;
}

/**
 * Dashboard statistics card with glassmorphism effect.
 * Displays a metric count with icon and label.
 */
export function StatCard({ title, value, icon: Icon, className, loading }: StatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-neutral-200/60 bg-white transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transform-gpu",
        "dark:border-white/10 dark:bg-neutral-900 dark:hover:shadow-white/5",
        className
      )}
    >
      <CardContent className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </p>
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {loading ? (
                <Skeleton className="h-9 w-12 mt-1" />
              ) : (
                <AnimatedNumber value={value} />
              )}
            </div>
          </div>
          <div className="rounded-xl bg-neutral-100 p-2.5 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-white/10 dark:group-hover:bg-white dark:group-hover:text-neutral-900">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
