"use client";

import { useEditorContext, usePublicAuth } from "@tribe-nest/frontend-shared";
import { useEffect } from "react";

export function usePublicAuthGuard() {
  const { user, isInitialized } = usePublicAuth();
  const { navigate } = useEditorContext();

  useEffect(() => {
    if (isInitialized && !user) {
      const intendedPath = window.location.pathname;
      const searchParams = window.location.search;
      navigate(`/login?redirect=${intendedPath}${searchParams}`);
    }
  }, [isInitialized, user, navigate]);
}
