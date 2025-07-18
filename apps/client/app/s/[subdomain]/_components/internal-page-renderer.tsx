"use client";
import { PageHeaderWithoutEditor, useEditorContext, usePublicAuth } from "@tribe-nest/frontend-shared";

type Props = {
  children: React.ReactNode;
};

export function InternalPageRenderer({ children }: Props) {
  const { themeSettings } = useEditorContext();
  const { isInitialized } = usePublicAuth();

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="w-full min-h-screen h-auto" style={{ backgroundColor: themeSettings.colors.background }}>
      <PageHeaderWithoutEditor hasBorder={true} />
      {children}
    </div>
  );
}

export default InternalPageRenderer;
