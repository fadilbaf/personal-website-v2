import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy for:
 * 1. Multi-domain isolation:
 *    - admin.fadil.bafagih.id (or admin.localhost): only serves /login, /dashboard, and admin routes. Public routes return 404.
 *    - fadil.bafagih.id: serves public routes with i18n locale prefixes. Accessing /login or /dashboard returns 404.
 *    - local dev (localhost / 127.0.0.1): allows accessing both public routes and admin routes for easy development.
 * 2. Auth session refresh & protection via Supabase SSR.
 * 3. Locale redirection for public website.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  // 1. Check environment & domain type
  const isLocal =
    process.env.NODE_ENV === "development" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local");

  const isAdminSubdomain = hostname.startsWith("admin.") || hostname === "admin";

  // 2. Identify route types
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLoginRoute = pathname === "/login";
  const isAdminPrefixedRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminOnlyRoute = isDashboardRoute || isLoginRoute || isAdminPrefixedRoute;

  const hasLocale = pathname.startsWith("/en") || pathname.startsWith("/id");
  const isApiRoute = pathname.startsWith("/api");
  const isStaticFile = pathname.includes(".");

  // 3. MAIN DOMAIN (Production non-admin): Block /login, /dashboard, and /admin routes with 404
  if (!isAdminSubdomain && !isLocal && isAdminOnlyRoute) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/not-found";
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  // 4. ADMIN SUBDOMAIN: Block public localized or non-admin routes with 404
  if (isAdminSubdomain) {
    const isAllowedAdminPath =
      pathname === "/" ||
      isAdminOnlyRoute ||
      isApiRoute ||
      isStaticFile;

    if (!isAllowedAdminPath || hasLocale) {
      const notFoundUrl = request.nextUrl.clone();
      notFoundUrl.pathname = "/not-found";
      return NextResponse.rewrite(notFoundUrl, { status: 404 });
    }
  }

  // 5. PUBLIC DOMAIN / LOCAL DEV: Locale redirection for public routes
  if (!isAdminSubdomain && !hasLocale && !isAdminOnlyRoute && !isApiRoute && !isStaticFile) {
    const cookieLanguage = request.cookies.get("admin-language")?.value;
    let locale = "en";
    if (cookieLanguage === "en" || cookieLanguage === "id") {
      locale = cookieLanguage;
    } else {
      const acceptLanguage = request.headers.get("accept-language") || "";
      if (acceptLanguage.toLowerCase().includes("id")) {
        locale = "id";
      }
    }

    const redirectPathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = redirectPathname;
    return NextResponse.redirect(url);
  }

  // 6. Supabase session handling & route protection
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 7. Admin subdomain root redirection: / -> /dashboard (if authenticated) or /login (if unauthenticated)
  if (isAdminSubdomain && pathname === "/") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(targetUrl);
  }

  // 8. Auth protection for /dashboard and /login
  if (isDashboardRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
