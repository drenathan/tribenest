import { NextRequest, NextResponse } from "next/server";
import { rootDomain } from "../../../lib/utils";

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0] ?? "";
  console.log("hostname", hostname, rootDomain, request.url, host);

  // Local development environment
  if (request.url.includes("localhost") || request.url.includes("127.0.0.1")) {
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0] ?? "";
    }
    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? (parts[0] ?? "") : "";
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export async function GET(request: NextRequest) {
  const subdomain = extractSubdomain(request);

  if (subdomain && subdomain === "links") {
    // Block PWA installation for "links" subdomain by returning 404
    return new NextResponse(null, { status: 404 });
  }

  // Default app info
  let appInfo = {
    name: "TribeNest",
    short_name: "TribeNest",
    description: "Your digital presence, simplified.",
    start_url: "/",
    scope: "/",
  };

  // TODO: Fetch subdomain-specific data from your API
  // This would typically fetch from your database based on the subdomain
  if (subdomain && subdomain !== "default-site") {
    try {
      // Example API call to get subdomain-specific info
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/by-subdomain/${subdomain}`);
      // const profileData = await response.json();

      // For now, we'll use the subdomain as the app name
      appInfo = {
        name: `${subdomain} - TribeNest`,
        short_name: subdomain,
        description: `${subdomain}'s digital space powered by TribeNest`,
        start_url: "/",
        scope: "/",
      };
    } catch (error) {
      console.error("Error fetching subdomain data:", error);
      // Fallback to default with subdomain
      appInfo.name = `${subdomain} - TribeNest`;
      appInfo.short_name = subdomain;
    }
  }

  const manifest = {
    name: appInfo.name,
    short_name: appInfo.short_name,
    description: appInfo.description,
    start_url: appInfo.start_url,
    scope: appInfo.scope,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/tribenest_pwa.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/tribenest_pwa2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["social", "productivity", "business"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Home",
        short_name: "Home",
        description: "Go to homepage",
        url: "/",
        icons: [
          {
            src: "/tribenest_small.png",
            sizes: "96x96",
          },
        ],
      },
    ],
    screenshots: [
      {
        src: "/tribenest_wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Desktop view",
      },
      {
        src: "/tribenest_narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Mobile view",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
