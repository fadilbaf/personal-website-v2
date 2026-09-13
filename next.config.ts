import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uiotodwgeplnmxbfsloi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  env: {
    APP_VERSION: packageJson.version,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
    UMAMI_HOST_URL: process.env.UMAMI_HOST_URL,
    UMAMI_SHARE_ID: process.env.UMAMI_SHARE_ID,
    SITE_URL: process.env.SITE_URL,
  },
  async rewrites() {
    return [
      {
        source: "/cv.pdf",
        destination: "/cv",
      },
      {
        source: "/storage/:path*",
        destination: "https://uiotodwgeplnmxbfsloi.supabase.co/storage/v1/object/public/assets/:path*",
      },
    ];
  },
};

export default nextConfig;
