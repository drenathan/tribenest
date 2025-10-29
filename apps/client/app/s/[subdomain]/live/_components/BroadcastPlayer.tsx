import { useEditorContext } from "@tribe-nest/frontend-shared";
import React from "react";
import { ILiveBroadcast } from "./types";
import ReactPlayer from "react-player";
import { formatDistanceToNow } from "date-fns";

type Props = {
  broadcast: ILiveBroadcast;
};

export function BroadcastPlayer({ broadcast }: Props) {
  const { themeSettings } = useEditorContext();
  return (
    <div className="p-4 flex gap-8 max-w-[1700px] mx-auto">
      <div
        className="flex-1 aspect-video"
        style={{
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          border: `1px solid ${themeSettings.colors.primary}30`,
        }}
      >
        <ReactPlayer src={broadcast.liveUrl} width="100%" height="100%" controls autoPlay />
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="text-2xl font-medium">{broadcast.title}</p>
            <div className="flex items-center gap-6 mt-2 text-sm">
              <p>20 watching now </p>
              {broadcast.startedAt && <p>Started {formatDistanceToNow(new Date(broadcast.startedAt))}</p>}
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-[400px]"
        style={{
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          border: `1px solid ${themeSettings.colors.primary}30`,
        }}
      >
        <p className="text-lg p-4" style={{ borderBottom: `1px solid ${themeSettings.colors.primary}30` }}>
          Chat
        </p>
      </div>
    </div>
  );
}

export default BroadcastPlayer;
