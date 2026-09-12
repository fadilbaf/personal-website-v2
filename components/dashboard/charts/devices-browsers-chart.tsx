"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop, Smartphone, Tablet, Monitor } from "lucide-react";

interface DevicesBrowsersChartProps {
  devices: Array<{ name: string; value: number }>;
  browsers: Array<{ name: string; value: number }>;
  loading: boolean;
  devicesTitle: string;
  browsersTitle: string;
  noDataLabel?: string;
}

function getDeviceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone")) {
    return Smartphone;
  }
  if (lower.includes("tablet") || lower.includes("ipad")) {
    return Tablet;
  }
  if (lower.includes("laptop") || lower.includes("desktop")) {
    return Laptop;
  }
  return Monitor;
}

export function DevicesBrowsersChart({
  devices,
  browsers,
  loading,
  devicesTitle,
  browsersTitle,
  noDataLabel = "No data yet",
}: DevicesBrowsersChartProps) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  const totalDevices = devices.reduce((sum, d) => sum + d.value, 0);
  const totalBrowsers = browsers.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Devices Card */}
      <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {devicesTitle}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
              {noDataLabel}
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1 max-h-[200px] overflow-y-auto pr-1">
              {devices.map((d) => {
                const Icon = getDeviceIcon(d.name);
                const pct = totalDevices > 0 ? Math.round((d.value / totalDevices) * 100) : 0;
                return (
                  <div key={d.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-neutral-900 dark:text-white flex items-center gap-2 capitalize">
                        <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>{d.name}</span>
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                        {d.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browsers Card */}
      <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {browsersTitle}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {browsers.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
              {noDataLabel}
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1 max-h-[200px] overflow-y-auto pr-1">
              {browsers.map((b) => {
                const pct = totalBrowsers > 0 ? Math.round((b.value / totalBrowsers) * 100) : 0;
                return (
                  <div key={b.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-neutral-900 dark:text-white truncate">
                        {b.name}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                        {b.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
