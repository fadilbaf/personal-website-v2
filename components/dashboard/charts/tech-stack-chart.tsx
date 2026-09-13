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
import { Wrench } from "lucide-react";

interface TechStackChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

/**
 * Vertical bar chart showing the most-used tech stack across projects.
 * Displays top 10 skills with graduated grayscale bars.
 */
export function TechStackChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: TechStackChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#a3a3a3" : "#737373";
  const barColor = isDark ? "#d4d4d4" : "#262626";
  const gridColor = isDark ? "#333333" : "#e5e5e5";

  return (
    <Card className="border-neutral-200/60 bg-white dark:border-white/10 dark:bg-neutral-900">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
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
          <ResponsiveContainer width="100%" height={220} className="outline-none select-none">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              className="outline-none"
            >
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke={textColor}
                angle={-35}
                textAnchor="end"
                height={60}
                interval={0}
                tickFormatter={(val) =>
                  val.length > 10 ? val.slice(0, 10) + "…" : val
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
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {data.map((_, index) => {
                  const opacity = 1 - index * 0.07;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColor}
                      fillOpacity={Math.max(opacity, 0.3)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
