import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache response for 60 seconds

const UMAMI_HOST = process.env.NEXT_PUBLIC_UMAMI_HOST_URL || "https://cloud.umami.is";
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "1296ad69-d818-4bc9-8148-ae27f265e324";
const SHARE_ID = process.env.NEXT_PUBLIC_UMAMI_SHARE_ID || "Xycy2JyKJMRnpj73";

// Umami Cloud routes API calls through regional clusters (e.g. /analytics/us/api)
const API_BASE_CANDIDATES = [
  `${UMAMI_HOST}/analytics/us/api`,
  `${UMAMI_HOST}/api`,
  `https://api.umami.is/v1`,
];

// In-memory token cache
let cachedShareToken: { token: string; apiBase: string; expiresAt: number } | null = null;

async function getShareToken(): Promise<{ token: string; apiBase: string } | null> {
  const now = Date.now();
  if (cachedShareToken && cachedShareToken.expiresAt > now) {
    return { token: cachedShareToken.token, apiBase: cachedShareToken.apiBase };
  }

  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/share/${SHARE_ID}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.shareToken || data.id;
        if (token) {
          cachedShareToken = {
            token,
            apiBase: base,
            expiresAt: now + 30 * 60 * 1000, // 30 minutes
          };
          return { token, apiBase: base };
        }
      }
    } catch {
      // Try next candidate
    }
  }

  return null;
}

export async function GET() {
  try {
    const authResult = await getShareToken();
    const shareToken = authResult?.token || null;
    const apiBase = authResult?.apiBase || API_BASE_CANDIDATES[0];

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (shareToken) {
      headers["x-umami-share-token"] = shareToken;
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Helper for safe fetch
    const fetchUmami = async (endpoint: string) => {
      try {
        const url = `${apiBase}/websites/${WEBSITE_ID}/${endpoint}`;
        const res = await fetch(url, { headers, next: { revalidate: 30 } });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    // Parallel fetch all data points
    const [
      statsData,
      pageviewsData,
      countriesData,
      referrersData,
      devicesData,
      osData,
      browsersData,
      pagesData,
      eventsData,
      activeData,
    ] = await Promise.all([
      fetchUmami(`stats?startAt=${thirtyDaysAgo}&endAt=${now}`),
      fetchUmami(`pageviews?startAt=${thirtyDaysAgo}&endAt=${now}&unit=day`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=country`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=referrer`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=device`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=os`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=browser`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=url`),
      fetchUmami(`metrics?startAt=${thirtyDaysAgo}&endAt=${now}&type=event`),
      fetchUmami(`active`),
    ]);

    // Compute formatted stats
    const pageviews = statsData?.pageviews?.value ?? 0;
    const uniqueVisitors = statsData?.visitors?.value ?? 0;
    const totalVisits = statsData?.visits?.value ?? 0;
    const totalBounces = statsData?.bounces?.value ?? 0;
    const totalTimeSeconds = statsData?.totaltime?.value ?? 0;
    const liveVisitors = Array.isArray(activeData) ? activeData.length : (activeData?.x ?? 0);

    const bounceRate =
      totalVisits > 0 ? Math.round((totalBounces / totalVisits) * 100) : 0;
    const avgDurationSeconds =
      totalVisits > 0 ? Math.round(totalTimeSeconds / totalVisits) : 0;

    // Format views trend
    const viewsTrend: Array<{ date: string; views: number; visitors: number }> = [];
    if (pageviewsData?.pageviews && Array.isArray(pageviewsData.pageviews)) {
      pageviewsData.pageviews.forEach((pv: { x: string; y: number }, idx: number) => {
        const dateStr = pv.x.split(" ")[0] || pv.x;
        const visitors = pageviewsData.sessions?.[idx]?.y ?? 0;
        viewsTrend.push({
          date: dateStr,
          views: pv.y || 0,
          visitors: visitors || 0,
        });
      });
    }

    // Format Top Countries
    const countries = Array.isArray(countriesData)
      ? countriesData.slice(0, 8).map((c: { x: string; y: number }) => ({
          country: c.x || "Unknown",
          visitors: Number(c.y) || 0,
        }))
      : [];

    // Format Referrers / Traffic Sources
    const referrers = Array.isArray(referrersData)
      ? referrersData.slice(0, 8).map((r: { x: string; y: number }) => ({
          source: r.x ? r.x.replace(/^https?:\/\//, "").replace(/\/$/, "") : "Direct",
          visitors: Number(r.y) || 0,
        }))
      : [];

    // Format Devices
    const devices = Array.isArray(devicesData)
      ? devicesData.map((d: { x: string; y: number }) => ({
          name: d.x || "Unknown",
          value: Number(d.y) || 0,
        }))
      : [];

    // Format OS
    const osList = Array.isArray(osData)
      ? osData.slice(0, 6).map((o: { x: string; y: number }) => ({
          name: o.x || "Unknown",
          value: Number(o.y) || 0,
        }))
      : [];

    // Format Browsers
    const browsers = Array.isArray(browsersData)
      ? browsersData.slice(0, 6).map((b: { x: string; y: number }) => ({
          name: b.x || "Unknown",
          value: Number(b.y) || 0,
        }))
      : [];

    // Format Top Projects & Top Blogs from URLs
    const topProjectsMap: Record<string, number> = {};
    const topBlogsMap: Record<string, number> = {};
    let idLangCount = 0;
    let enLangCount = 0;

    if (Array.isArray(pagesData)) {
      pagesData.forEach((p: { x: string; y: number }) => {
        const path = p.x || "";
        const count = Number(p.y) || 0;

        if (path.includes("/id")) idLangCount += count;
        if (path.includes("/en")) enLangCount += count;

        if (path.includes("/projects/")) {
          const slug = path.split("/projects/")[1]?.split(/[?#/]/)[0];
          if (slug) topProjectsMap[slug] = (topProjectsMap[slug] || 0) + count;
        } else if (path.includes("/blogs/")) {
          const slug = path.split("/blogs/")[1]?.split(/[?#/]/)[0];
          if (slug) topBlogsMap[slug] = (topBlogsMap[slug] || 0) + count;
        }
      });
    }

    // Top projects array
    const topProjects = Object.entries(topProjectsMap)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // Top blogs array
    const topBlogs = Object.entries(topBlogsMap)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // CV Downloads from events
    let cvDownloads = 0;
    if (Array.isArray(eventsData)) {
      const cvEvt = eventsData.find((e: { x: string; y: number }) => e.x === "cv_download");
      if (cvEvt) cvDownloads = Number(cvEvt.y) || 0;
    }

    // Language ratio
    const languageRatio = [
      { name: "Indonesia", value: idLangCount },
      { name: "English", value: enLangCount },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        pageviews,
        uniqueVisitors,
        liveVisitors,
        bounceRate,
        avgDurationSeconds,
        cvDownloads,
      },
      viewsTrend,
      countries,
      referrers,
      devices,
      osList,
      browsers,
      topProjects,
      topBlogs,
      languageRatio,
      shareUrl: `https://cloud.umami.is/share/${SHARE_ID}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
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
        shareUrl: `https://cloud.umami.is/share/${SHARE_ID}`,
      },
      { status: 200 }
    );
  }
}
