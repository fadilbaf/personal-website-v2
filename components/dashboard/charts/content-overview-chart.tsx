"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LayoutGrid } from "lucide-react";

interface ContentOverviewChartProps {
  data: { module: string; total: number; active: number; inactive: number }[];
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

/**
 * Custom tooltip showing module total, active, and inactive breakdown
 */
function CustomContentTooltip({ active, payload, isDark }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-150 border-neutral-200/80 bg-white/95 text-neutral-900 dark:border-white/10 dark:bg-neutral-900/95 dark:text-white min-w-[140px]">
      <div className="font-semibold border-b border-neutral-100 dark:border-white/10 pb-1 mb-1.5 flex items-center justify-between">
        <span>{item.name}</span>
        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          Total: {item.Total}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2 w-2 rounded-full inline-block bg-neutral-900 dark:bg-white" />
            Active:
          </span>
          <span className="font-semibold text-neutral-900 dark:text-white font-mono">
            {item.Active}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2 w-2 rounded-full inline-block bg-neutral-400 dark:bg-neutral-600" />
            Inactive:
          </span>
          <span className="font-semibold text-neutral-500 dark:text-neutral-400 font-mono">
            {item.Inactive}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ContentOverviewChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: ContentOverviewChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#a3a3a3" : "#737373";

  const chartData = data.map((d) => ({
    name: d.module.charAt(0).toUpperCase() + d.module.slice(1),
    Total: d.total,
    Active: d.active,
    Inactive: d.inactive,
  }));

  const hasData = chartData.some((d) => d.Total > 0);

  return (
    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : !hasData ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
            {noDataLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} className="outline-none select-none">
            <BarChart
              data={chartData}
              barGap={0}
              barSize={20}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              className="outline-none"
            >
              <XAxis
                dataKey="name"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke={textColor}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke={textColor}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomContentTooltip isDark={isDark} />}
                cursor={false}
                wrapperStyle={{ zIndex: 40, outline: "none" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: textColor, paddingTop: "8px" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="Active"
                fill={isDark ? "#ffffff" : "#171717"}
                radius={[3, 3, 0, 0]}
                minPointSize={3}
              />
              <Bar
                dataKey="Inactive"
                fill={isDark ? "#525252" : "#a3a3a3"}
                radius={[3, 3, 0, 0]}
                minPointSize={3}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
