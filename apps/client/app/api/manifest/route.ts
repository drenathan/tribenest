import { NextRequest, NextResponse } from "next/server";
import { extractSubdomain } from "../../../lib/utils";
import { WebPage } from "@/app/s/[subdomain]/_api";

export async function GET(request: NextRequest) {
  const subdomain = await extractSubdomain(request);

  if (subdomain && subdomain === "links") {
    // Block PWA installation for "links" subdomain by returning 404
    return new NextResponse(null, { status: 404 });
  }

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const isMultiTenant = process.env.MULTI_TENANT === "true";

  if (isMultiTenant && !subdomain) {
    return new NextResponse(null, { status: 404 });
  }

  const response = await fetch(
    `${apiUrl}/public/websites?subdomain=${isMultiTenant ? subdomain : "default-site"}&pathname=/`,
  );
  const webPage = (await response.json()) as WebPage;

  if (!webPage || !webPage.profile?.pwaConfig || !webPage.profile.pwaConfig.name) {
    return new NextResponse(null, { status: 404 });
  }
  if (webPage) {
    try {
      const appInfo = {
        name: webPage.profile.pwaConfig.name,
        short_name: webPage.profile.pwaConfig.shortName,
        description: webPage.profile.pwaConfig.description,
        start_url: "/",
        scope: "/",
      };

      const manifest = {
        name: appInfo.name,
        short_name: appInfo.short_name,
        description: appInfo.description,
        start_url: appInfo.start_url,
        scope: appInfo.scope,
        display: "standalone",
        background_color: webPage.themeSettings.colors.primary,
        theme_color: webPage.themeSettings.colors.primary,
        orientation: "portrait-primary",
        icons: [
          {
            src: webPage.profile.pwaConfig.icon192,
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: webPage.profile.pwaConfig.icon512,
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
            name: "Music",
            short_name: "Music",
            description: "Go to music page",
            url: "/music",
            icons: [
              {
                src: webPage.profile.pwaConfig.icon96,
                sizes: "96x96",
              },
            ],
          },
          {
            name: "Posts",
            short_name: "Posts",
            description: "Go to posts page",
            url: "/members",
            icons: [
              {
                src: webPage.profile.pwaConfig.icon96,
                sizes: "96x96",
              },
            ],
          },
          {
            name: "Account",
            short_name: "Account",
            description: "Go to My Account",
            url: "/account",
            icons: [
              {
                src: webPage.profile.pwaConfig.icon96,
                sizes: "96x96",
              },
            ],
          },
        ],
        screenshots: [
          {
            src: webPage.profile.pwaConfig.screenshotWide1280X720,
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop view",
          },
          {
            src: webPage.profile.pwaConfig.screenshotNarrow750X1334,
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
    } catch (error) {
      console.error("Error fetching subdomain data:", error);
    }
  }

  return new NextResponse(null, { status: 404 });
}
