"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Filter, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/src/app/lib/utils";

export type TrendTimeRange = "30d" | "3m" | "6m" | "9m" | "1y" | "all";

interface ViewsTrendChartProps {
  data: Array<{ date: string; views: number; visitors?: number }>;
  loading: boolean;
  title: string;
  noDataLabel?: string;
}

export function ViewsTrendChart({
  data,
  loading,
  title,
  noDataLabel = "No data yet",
}: ViewsTrendChartProps) {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [timeRange, setTimeRange] = useState<TrendTimeRange>("30d");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const strokeColor = isDark ? "#ffffff" : "#171717";
  const visitorStrokeColor = isDark ? "#737373" : "#a3a3a3";
  const gridColor = isDark ? "#262626" : "#f0f0f0";
  const textColor = isDark ? "#a3a3a3" : "#737373";

  // Filter data based on selected range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === "all") return data;

    const now = new Date();
    const cutoff = new Date();

    if (timeRange === "30d") cutoff.setDate(now.getDate() - 30);
    else if (timeRange === "3m") cutoff.setMonth(now.getMonth() - 3);
    else if (timeRange === "6m") cutoff.setMonth(now.getMonth() - 6);
    else if (timeRange === "9m") cutoff.setMonth(now.getMonth() - 9);
    else if (timeRange === "1y") cutoff.setFullYear(now.getFullYear() - 1);

    const year = cutoff.getFullYear();
    const month = String(cutoff.getMonth() + 1).padStart(2, "0");
    const day = String(cutoff.getDate()).padStart(2, "0");
    const cutoffStr = `${year}-${month}-${day}`;

    return data.filter((d) => d.date >= cutoffStr);
  }, [data, timeRange]);

  // Compute responsive dynamic width for horizontal scroll when many data points exist
  const minChartWidth = useMemo(() => {
    const points = filteredData.length;
    if (points > 120) return `${Math.max(points * 12, 1200)}px`;
    if (points > 60) return `${Math.max(points * 16, 900)}px`;
    if (points > 30) return `${Math.max(points * 22, 700)}px`;
    return "100%";
  }, [filteredData.length]);

  const ranges: { key: TrendTimeRange; label: string }[] = [
    { key: "30d", label: t("dashboard.filter_30d") },
    { key: "3m", label: t("dashboard.filter_3m") },
    { key: "6m", label: t("dashboard.filter_6m") },
    { key: "9m", label: t("dashboard.filter_9m") },
    { key: "1y", label: t("dashboard.filter_1y") },
    { key: "all", label: t("dashboard.filter_all") },
  ];

  return (
    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
      <CardHeader className="pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-3 relative z-30">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </CardTitle>
          </div>

          {/* Standard Admin Popup Filter (identical to DataTable) */}
          <div className="relative z-30" ref={dropdownRef}>
            <Button
              variant={timeRange !== "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 cursor-pointer border",
                timeRange !== "30d"
                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white hover:bg-neutral-800 active:bg-neutral-800 dark:hover:bg-neutral-200 dark:active:bg-neutral-200"
                  : "bg-white hover:bg-neutral-50 active:bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:active:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{t("common.filter")}</span>
              {timeRange !== "30d" && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
                  1
                </span>
              )}
            </Button>

            {/* Dropdown panel */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-popover transition-all duration-200">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {t("common.filters")}
                    </span>
                    {timeRange !== "30d" && (
                      <button
                        onClick={() => {
                          setTimeRange("30d");
                          setIsFilterOpen(false);
                        }}
                        className="text-[10px] flex items-center gap-1 text-neutral-400 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t("common.clear_all")}
                      </button>
                    )}
                  </div>

                  {/* Filter Section */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                      {t("dashboard.filter_time_range")}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ranges.map((opt) => {
                        const isSelected = timeRange === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setTimeRange(opt.key);
                              setIsFilterOpen(false);
                            }}
                            className={cn(
                              "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                              isSelected
                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                : "bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:active:bg-neutral-900 dark:text-neutral-400 dark:border-white/10"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : filteredData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
            {noDataLabel}
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
            <div style={{ minWidth: minChartWidth, width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280} className="outline-none select-none">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  className="outline-none"
                >
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={strokeColor} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={visitorStrokeColor} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={visitorStrokeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke={textColor}
                    tickFormatter={(val) => {
                      try {
                        const parts = String(val).split("-");
                        if (parts.length === 3) {
                          return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
                        }
                        const d = new Date(val);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      } catch {
                        return val;
                      }
                    }}
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
                      border: `1px solid ${isDark ? "#333333" : "#e5e5e5"}`,
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
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
                    labelFormatter={(val) => {
                      try {
                        const parts = String(val).split("-");
                        if (parts.length === 3) {
                          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                          return d.toLocaleDateString(t("language") === "id" ? "id-ID" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                        }
                        const d = new Date(val);
                        return d.toLocaleDateString(t("language") === "id" ? "id-ID" : "en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        return val;
                      }
                    }}
                  />
                  <Area
                    type="monotone"
                    name={t("dashboard.views")}
                    dataKey="views"
                    stroke={strokeColor}
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: strokeColor,
                      stroke: isDark ? "#171717" : "#ffffff",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    name={t("dashboard.visitors")}
                    dataKey="visitors"
                    stroke={visitorStrokeColor}
                    fill="url(#visitorsGradient)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: visitorStrokeColor,
                      stroke: isDark ? "#171717" : "#ffffff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
