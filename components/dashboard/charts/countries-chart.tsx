"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

interface CountriesChartProps {
  data: Array<{ country: string; visitors: number }>;
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  ID: "Indonesia",
  US: "United States",
  SG: "Singapore",
  MY: "Malaysia",
  GB: "United Kingdom",
  DE: "Germany",
  JP: "Japan",
  AU: "Australia",
  IN: "India",
  NL: "Netherlands",
  CA: "Canada",
  FR: "France",
  CN: "China",
  KR: "South Korea",
  BR: "Brazil",
};

export function CountriesChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: CountriesChartProps) {
  const maxVisitors = data.length > 0 ? Math.max(...data.map((d) => d.visitors)) : 1;
  const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3 py-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
            {noDataLabel}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {data.map((item) => {
              const countryName = COUNTRY_NAMES[item.country.toUpperCase()] || item.country;
              const percentage = totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0;
              const barWidth = Math.max(8, Math.round((item.visitors / maxVisitors) * 100));

              return (
                <div key={item.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-neutral-900 dark:text-white truncate font-medium">
                      {countryName}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 shrink-0 ml-2 font-mono">
                      {item.visitors} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500 ease-out"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
