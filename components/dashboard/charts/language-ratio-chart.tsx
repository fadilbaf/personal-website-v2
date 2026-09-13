"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Globe } from "lucide-react";

interface LanguageRatioChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

/**
 * Custom floating tooltip that renders slice information cleanly
 */
function CustomDonutTooltip({ active, payload, total, isDark }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const value = Number(item.value) || 0;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-150 border-neutral-200/80 bg-white/95 text-neutral-900 dark:border-white/10 dark:bg-neutral-900/95 dark:text-white">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: item.payload?.fill || (isDark ? "#ffffff" : "#171717") }}
        />
        <span className="font-semibold">{item.name}</span>
      </div>
      <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
        {value} views ({pct}%)
      </div>
    </div>
  );
}

/**
 * Donut chart showing language preference ratio (ID vs EN).
 * Features a floating tooltip and centered total views count.
 */
export function LanguageRatioChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: LanguageRatioChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const colors = isDark
    ? ["#ffffff", "#525252"]
    : ["#171717", "#a3a3a3"];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-neutral-200/60 bg-white dark:border-white/10 dark:bg-neutral-900">
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
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : total === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
            {noDataLabel}
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={220} className="outline-none select-none">
              <PieChart className="outline-none">
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomDonutTooltip total={total} isDark={isDark} />}
                  wrapperStyle={{ zIndex: 40, outline: "none" }}
                  offset={15}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-7">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {total}
                </div>
                <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Total
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-2">
              {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {entry.name}{" "}
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {entry.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
