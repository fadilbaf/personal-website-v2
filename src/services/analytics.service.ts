import { createClient } from "@/src/services/supabase/client";

export interface AnalyticsOverviewResponse {
  success: boolean;
  stats: {
    pageviews: number;
    uniqueVisitors: number;
    liveVisitors: number;
    bounceRate: number;
    avgDurationSeconds: number;
    cvDownloads: number;
  };
  viewsTrend: Array<{ date: string; views: number; visitors: number }>;
  countries: Array<{ country: string; visitors: number }>;
  referrers: Array<{ source: string; visitors: number }>;
  devices: Array<{ name: string; value: number }>;
  osList: Array<{ name: string; value: number }>;
  browsers: Array<{ name: string; value: number }>;
  topProjects: Array<{ name: string; clicks: number }>;
  topBlogs: Array<{ name: string; clicks: number }>;
  languageRatio: Array<{ name: string; value: number }>;
  shareUrl: string;
}

/**
 * Analytics service — integrates with Umami Cloud (traffic & visitor analytics)
 * and Supabase SQL views (content catalog metrics).
 */
export const AnalyticsService = {
  // ─── EVENT TRACKING (called from public site) ────────────────
  async trackEvent(payload: {
    event_type: string;
    event_key?: string;
    page_path?: string;
    referrer?: string;
    visitor_hash?: string;
  }) {
    const supabase = createClient();
    return supabase.from("analytics_events").insert(payload);
  },

  // ─── HYBRID OVERVIEW QUERY ──────────────────────────────────
  /** Fetch complete unified traffic & engagement overview. */
  async getOverviewData(): Promise<AnalyticsOverviewResponse> {
    try {
      const res = await fetch("/api/analytics/overview", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return await res.json();
    } catch {
      return {
        success: false,
        stats: {
          pageviews: 0,
          uniqueVisitors: 0,
          liveVisitors: 0,
          bounceRate: 0,
          avgDurationSeconds: 0,
          cvDownloads: 0,
        },
        viewsTrend: [],
        countries: [],
        referrers: [],
        devices: [],
        osList: [],
        browsers: [],
        topProjects: [],
        topBlogs: [],
        languageRatio: [
          { name: "Indonesia", value: 0 },
          { name: "English", value: 0 },
        ],
        shareUrl: `https://cloud.umami.is/share/${process.env.NEXT_PUBLIC_UMAMI_SHARE_ID || "Xycy2JyKJMRnpj73"}`,
      };
    }
  },

  // ─── SUPABASE CONTENT READS ─────────────────────────────────

  /** Tech stack distribution (from SQL view). */
  async getTechStackDistribution() {
    const supabase = createClient();
    const { data } = await supabase
      .from("view_tech_stack_distribution")
      .select("*")
      .limit(10);
    return (
      data?.map((d) => ({
        name: d.skill_name,
        value: Number(d.total_used),
      })) ?? []
    );
  },

  /** Project status breakdown (from SQL view). */
  async getProjectStatusBreakdown() {
    const supabase = createClient();
    const { data } = await supabase
      .from("view_project_status_breakdown")
      .select("*");
    return (
      data?.map((d) => ({
        name: d.status,
        value: Number(d.total),
      })) ?? []
    );
  },

  /** Blog status breakdown (from SQL view). */
  async getBlogStatusBreakdown() {
    const supabase = createClient();
    const { data } = await supabase
      .from("view_blog_status_breakdown")
      .select("*");
    return (
      data?.map((d) => ({
        name: d.status,
        value: Number(d.total),
      })) ?? []
    );
  },

  /** Achievement status breakdown (from SQL view). */
  async getAchievementStatusBreakdown() {
    const supabase = createClient();
    const { data } = await supabase
      .from("view_achievement_status_breakdown")
      .select("*");
    return (
      data?.map((d) => ({
        name: d.status,
        value: Number(d.total),
      })) ?? []
    );
  },

  /** Content overview — total items per module (from SQL view). */
  async getContentOverview() {
    const supabase = createClient();
    const { data } = await supabase
      .from("view_content_overview")
      .select("*");
    return (
      data?.map((d) => ({
        module: d.module,
        total: Number(d.total),
        active: Number(d.active),
        inactive: Number(d.inactive),
      })) ?? []
    );
  },
};
