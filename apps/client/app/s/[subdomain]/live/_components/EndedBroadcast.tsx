import React from "react";
import { ILiveBroadcast } from "./types";
import { useEditorContext } from "@tribe-nest/frontend-shared";

type Props = {
  broadcast: ILiveBroadcast;
};

export function EndedBroadcast({ broadcast }: Props) {
  const { themeSettings } = useEditorContext();
  return (
    <div className="px-4">
      <div
        key={broadcast.id}
        className="group mt-10 max-w-[500px] mx-auto"
        style={{
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          border: `1px solid ${themeSettings.colors.primary}30`,
        }}
      >
        <div className="relative">
          <div
            className="aspect-video flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${themeSettings.colors.primary}20, ${themeSettings.colors.primary}10)`,
            }}
          >
            {(broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl) && (
              <img
                src={broadcast.thumbnailUrl || broadcast.generatedThumbnailUrl}
                alt={broadcast.title}
                className="w-full h-full object-cover absolute top-0 left-0"
              />
            )}
            <p
              className="text-2xl font-medium bg-black/50 text-white p-4 rounded-lg z-10"
              style={{ color: themeSettings.colors.text }}
            >
              Broadcast Ended
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3
            className="font-semibold mb-2 line-clamp-2 transition-colors group-hover:opacity-80"
            style={{ color: themeSettings.colors.text }}
          >
            {broadcast.title}
          </h3>

          <div className="flex items-center text-sm space-x-2"></div>
        </div>
      </div>
    </div>
  );
}

export default EndedBroadcast;
