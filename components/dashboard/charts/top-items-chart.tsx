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
  Cell,
} from "recharts";
import { Trophy } from "lucide-react";

interface TopItemsChartProps {
  data: { name: string; clicks: number }[];
  loading: boolean;
  title: string;
  noDataLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Horizontal bar chart for top-clicked projects or blogs.
 * Shows up to 5 items sorted by click count.
 */
export function TopItemsChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
  icon: IconComp = Trophy,
}: TopItemsChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#a3a3a3" : "#737373";
  const barColors = isDark
    ? ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252"]
    : ["#171717", "#262626", "#404040", "#525252", "#737373"];

  return (
    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <IconComp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
            {noDataLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240} className="outline-none select-none">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              className="outline-none"
            >
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke={textColor}
                angle={-25}
                textAnchor="end"
                height={55}
                interval={0}
                tickFormatter={(val) =>
                  val.length > 14 ? val.slice(0, 14) + "…" : val
                }
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke={textColor}
                allowDecimals={false}
              />
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
              <Bar dataKey="clicks" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColors[index % barColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
