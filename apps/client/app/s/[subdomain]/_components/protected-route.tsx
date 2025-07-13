"use client";
import { useEditorContext, usePublicAuth } from "@tribe-nest/frontend-shared";
import { usePathname, useSearchParams } from "next/navigation";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isInitialized, user } = usePublicAuth();
  const { navigate } = useEditorContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirect = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    navigate(`/login?redirect=${redirect}`);
    return null;
  }

  return children;
};
