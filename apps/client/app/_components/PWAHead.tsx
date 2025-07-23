"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

interface PWAHeadProps {
  subdomain?: string;
  appName?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
}

export function PWAHead({ subdomain, appName, description, themeColor = "#000000" }: PWAHeadProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default values
  const defaultAppName = subdomain && subdomain !== "default-site" ? `${subdomain} - TribeNest` : "TribeNest";

  const defaultDescription =
    subdomain && subdomain !== "default-site"
      ? `${subdomain}'s digital space powered by TribeNest`
      : "Your digital presence, simplified.";

  const finalAppName = appName || defaultAppName;
  const finalDescription = description || defaultDescription;

  // Only render on client to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <Head>
      {/* Basic PWA Meta Tags */}
      <meta name="application-name" content={finalAppName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={finalAppName} />
      <meta name="description" content={finalDescription} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content={themeColor} />

      {/* Viewport Meta Tag */}
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" href="/tribenest_icon.png" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* Open Graph / Social Media */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalAppName} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content="/tribenest_icon.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={finalAppName} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content="/tribenest_icon.png" />

      {/* Additional PWA Meta */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Preload critical resources */}
      <link rel="preload" href="/tribenest_icon.png" as="image" />
    </Head>
  );
}
