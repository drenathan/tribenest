// Helper function to parse redirect URL
export const parseRedirectUrl = (url: string | undefined) => {
  if (!url) return { to: "/", replace: true };

  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    return {
      to: urlObj.pathname,
      search: Object.fromEntries(searchParams.entries()),
      replace: true,
    };
  } catch {
    return { to: "/", replace: true };
  }
};
