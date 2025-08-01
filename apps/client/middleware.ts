import { type NextRequest, NextResponse } from "next/server";
import { extractSubdomain } from "./lib/utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = await extractSubdomain(request);
  const isMultiTenant = process.env.MULTI_TENANT === "true";

  if (subdomain === "links") {
    return NextResponse.rewrite(new URL(`/s/links${pathname}`, request.url));
  }

  if (subdomain && isMultiTenant) {
    // Block access to admin page from subdomains
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // For any path on a subdomain, rewrite to the subdomain page with the path
    return NextResponse.rewrite(new URL(`/s/${subdomain}${pathname}`, request.url));
  }

  // On the root domain, allow normal access
  return NextResponse.rewrite(new URL(`/s/default-site${pathname}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
