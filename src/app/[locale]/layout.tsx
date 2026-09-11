import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/src/app/lib/utils";
import { ThemeProvider } from "@/components/dashboard/theme-provider";
import { PageTracker } from "@/components/analytics/page-tracker";
import { LinksToaster } from "@/src/components/links/links-toaster";
import { Analytics } from "@vercel/analytics/next";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fadilbafagih.com"),
  title: "Fadil Bafagih | Personal Website",
  description: "Personal website and portfolio of Fadil Bafagih.",
};

/**
 * Root layout for public pages under [locale].
 * Wraps with ThemeProvider for dark/light mode support (used by /links page).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="var(--foreground)" showSpinner={false} shadow={false} showForHashAnchor={false} />
          <PageTracker />
          {children}
          <LinksToaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
