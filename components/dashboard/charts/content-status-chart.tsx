"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { GitCompareArrows } from "lucide-react";

interface ContentStatusChartProps {
  data: { module: string; total: number; active: number; inactive: number }[];
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

export function ContentStatusChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: ContentStatusChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#a3a3a3" : "#737373";

  const chartData = data.map((d) => ({
    module: d.module.charAt(0).toUpperCase() + d.module.slice(1),
    Active: d.active,
    Inactive: d.inactive,
  }));

  const hasData = chartData.some((d) => d.Active > 0 || d.Inactive > 0);

  return (
    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} className="outline-none">
              <XAxis dataKey="module" fontSize={11} tickLine={false} axisLine={false} stroke={textColor} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke={textColor} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#171717" : "#ffffff",
                  border: isDark ? "1px solid #383838" : "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
                itemStyle={{
                  color: isDark ? "#ffffff" : "#171717",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: isDark ? "#ffffff" : "#0a0a0a",
                  fontWeight: 600,
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                cursor={false}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: textColor, paddingTop: "8px" }} iconType="circle" iconSize={8} />
              <Bar dataKey="Active" fill={isDark ? "#ffffff" : "#171717"} radius={[4, 4, 0, 0]} maxBarSize={32} minPointSize={3} />
              <Bar dataKey="Inactive" fill={isDark ? "#525252" : "#a3a3a3"} radius={[4, 4, 0, 0]} maxBarSize={32} minPointSize={3} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
