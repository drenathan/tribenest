import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Use env to make variables available at build time, but they'll be overridden at runtime
  env: {
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.ROOT_DOMAIN || "localhost:3000",
    NEXT_PUBLIC_API_URL: process.env.API_URL || "http://localhost:8000",
  },
  // Use publicRuntimeConfig as fallback
  publicRuntimeConfig: {
    rootDomain: process.env.ROOT_DOMAIN || "localhost:3000",
    apiUrl: process.env.API_URL || "http://localhost:8000",
  },
};

export default pwaConfig(nextConfig);
