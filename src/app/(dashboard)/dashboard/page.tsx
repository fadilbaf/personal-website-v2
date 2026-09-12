"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Users,
  Radio,
  Clock,
  Download,
  Package,
  FolderKanban,
  FileText,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { OverviewStatCard } from "@/components/dashboard/charts/overview-stat-card";
import { ViewsTrendChart } from "@/components/dashboard/charts/views-trend-chart";
import { CountriesChart } from "@/components/dashboard/charts/countries-chart";
import { TrafficSourcesChart } from "@/components/dashboard/charts/traffic-sources-chart";
import { DevicesBrowsersChart } from "@/components/dashboard/charts/devices-browsers-chart";
import { TopItemsChart } from "@/components/dashboard/charts/top-items-chart";
import { LanguageRatioChart } from "@/components/dashboard/charts/language-ratio-chart";
import { TechStackChart } from "@/components/dashboard/charts/tech-stack-chart";
import { ContentOverviewChart } from "@/components/dashboard/charts/content-overview-chart";
import { AnalyticsService } from "@/src/services/analytics.service";
import { StatisticsService } from "@/src/services/statistics.service";
import { useLanguage } from "@/context/language-context";

/**
 * Enhanced Dashboard Overview — Complete analytics hub combining
 * Umami real-time traffic intelligence and Supabase content metrics.
 */
export default function DashboardPage() {
  const { t } = useLanguage();

  // ─── 1. Unified Umami Analytics Query ─────────────────────────
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: AnalyticsService.getOverviewData,
    refetchInterval: 30000, // Refresh realtime data every 30s
    meta: { silent: true },
  });

  // ─── 2. Supabase Content Statistics Queries ───────────────────
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: StatisticsService.getAll,
    meta: { resource: "dashboard.title" },
  });

  const { data: techStack = [], isLoading: isTechLoading } = useQuery({
    queryKey: ["analytics", "techStack"],
    queryFn: AnalyticsService.getTechStackDistribution,
    meta: { silent: true },
  });

  const { data: contentOverview = [], isLoading: isOverviewLoading } = useQuery({
    queryKey: ["analytics", "contentOverview"],
    queryFn: AnalyticsService.getContentOverview,
    meta: { silent: true },
  });

  const totalContent = stats
    ? stats.total_skills +
      stats.total_projects +
      stats.total_achievements +
      stats.total_careers +
      stats.total_educations +
      stats.total_organizations +
      stats.total_blogs
    : 0;

  const noData = t("dashboard.no_data_yet");

  // Helper for formatting duration
  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const overviewStats = analytics?.stats || {
    pageviews: 0,
    uniqueVisitors: 0,
    liveVisitors: 0,
    bounceRate: 0,
    avgDurationSeconds: 0,
    cvDownloads: 0,
  };

  const isCardsLoading = isAnalyticsLoading || isStatsLoading;

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        icon={LayoutDashboard}
        actions={
          analytics?.shareUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium cursor-pointer"
              onClick={() => window.open(analytics.shareUrl, "_blank")}
            >
              <span>{t("dashboard.open_umami")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : undefined
        }
      />

      {/* ─── Row 1: Primary Traffic & Live Stat Cards (3 Cards) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        <OverviewStatCard
          title={t("dashboard.page_views")}
          value={overviewStats.pageviews}
          icon={Eye}
          loading={isCardsLoading}
        />
        <OverviewStatCard
          title={t("dashboard.unique_visitors")}
          value={overviewStats.uniqueVisitors}
          icon={Users}
          loading={isCardsLoading}
        />
        <OverviewStatCard
          title={t("dashboard.live_visitors")}
          value={overviewStats.liveVisitors}
          icon={Radio}
          loading={isCardsLoading}
          badge={
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          }
        />
      </div>

      {/* ─── Row 2: Secondary Metric Stat Cards (3 Cards) ────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <OverviewStatCard
          title={t("dashboard.avg_duration")}
          value={overviewStats.avgDurationSeconds}
          formatValue={formatDuration}
          icon={Clock}
          loading={isCardsLoading}
        />
        <OverviewStatCard
          title={t("dashboard.cv_downloads")}
          value={overviewStats.cvDownloads}
          icon={Download}
          loading={isCardsLoading}
        />
        <OverviewStatCard
          title={t("dashboard.total_content")}
          value={totalContent}
          icon={Package}
          loading={isCardsLoading}
        />
      </div>

      {/* ─── Row 3: Views & Visitor Trend (Full Width) ─────────── */}
      <div className="mb-6">
        <ViewsTrendChart
          data={analytics?.viewsTrend || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.views_trend")}
          noDataLabel={noData}
        />
      </div>

      {/* ─── Row 4: Geografi & Traffic Sources ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <CountriesChart
          data={analytics?.countries || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.top_countries")}
          noDataLabel={noData}
        />
        <TrafficSourcesChart
          data={analytics?.referrers || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.traffic_sources")}
          noDataLabel={noData}
        />
      </div>

      {/* ─── Row 5: Devices & Browsers ──────────────────────── */}
      <div className="mb-6">
        <DevicesBrowsersChart
          devices={analytics?.devices || []}
          browsers={analytics?.browsers || []}
          loading={isAnalyticsLoading}
          devicesTitle={t("dashboard.devices")}
          browsersTitle={t("dashboard.browsers")}
          noDataLabel={noData}
        />
      </div>

      {/* ─── Row 6: Top Projects & Top Blogs (Side by Side in 1 Row) ── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <TopItemsChart
          data={analytics?.topProjects || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.top_projects")}
          noDataLabel={noData}
          icon={FolderKanban}
        />
        <TopItemsChart
          data={analytics?.topBlogs || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.top_blogs")}
          noDataLabel={noData}
          icon={FileText}
        />
      </div>

      {/* ─── Row 7: Language Ratio + Tech Stack ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <LanguageRatioChart
          data={analytics?.languageRatio || []}
          loading={isAnalyticsLoading}
          title={t("dashboard.language_ratio")}
          noDataLabel={noData}
        />
        <TechStackChart
          data={techStack}
          loading={isTechLoading}
          title={t("dashboard.tech_stack")}
          noDataLabel={noData}
        />
      </div>

      {/* ─── Row 8: Content Overview (Full Width, Unified Total & Status) ── */}
      <div className="mb-6">
        <ContentOverviewChart
          data={contentOverview}
          loading={isOverviewLoading}
          title={t("dashboard.content_overview")}
          noDataLabel={noData}
        />
      </div>
    </>
  );
}
