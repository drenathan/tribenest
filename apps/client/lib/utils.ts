// Cache for runtime config
let runtimeConfigCache: { rootDomain: string } | null = null;
let configPromise: Promise<{ rootDomain: string }> | null = null;

// Fetch runtime configuration from API route
const fetchRuntimeConfig = async (): Promise<{ rootDomain: string }> => {
  if (runtimeConfigCache) {
    return runtimeConfigCache;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Get the current origin to make the API call
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const response = await fetch(`${origin}/api/config`);
      const config = await response.json();

      runtimeConfigCache = config;
      console.log("Utils: Fetched runtime config:", config);

      return config;
    } catch (error) {
      console.error("Utils: Failed to fetch runtime config:", error);
      // Fallback to localhost
      return {
        rootDomain: "localhost:3000",
      };
    }
  })();

  return configPromise;
};

// Get rootDomain with proper fallbacks
const getRootDomainValue = async (): Promise<string> => {
  if (typeof window !== "undefined") {
    // Client-side: fetch from API route
    const config = await fetchRuntimeConfig();
    return config.rootDomain;
  } else {
    // Server-side: use environment variables directly
    return process.env.ROOT_DOMAIN || process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  }
};

export const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

// Initialize with fallback
let rootDomain = "localhost:3000";

// Update rootDomain with runtime config on client-side
if (typeof window !== "undefined") {
  getRootDomainValue().then((domain) => {
    rootDomain = domain;
    console.log("Utils: Updated rootDomain with runtime config:", rootDomain);
  });
}

// Factory function to get rootDomain with guaranteed config
export const getRootDomain = async () => {
  const config = await fetchRuntimeConfig();
  return config.rootDomain;
};

export { rootDomain };

export function isUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
