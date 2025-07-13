export const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
export function isUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
