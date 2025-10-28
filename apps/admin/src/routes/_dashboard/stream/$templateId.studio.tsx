import "hacktimer";
import { useAuth } from "@/hooks/useAuth";
import httpClient, { getLiveKitUrl } from "@/services/httpClient";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Room } from "livekit-client";
import { RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import { useGetStreamTemplate } from "@/hooks/queries/useStreams";
import { PreJoin } from "./-components/PreJoin";
import { useParticipantStore } from "./-components/store";

import { StudioContent } from "./-components/StudioContent";

export const Route = createFileRoute("/_dashboard/stream/$templateId/studio")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const [room] = useState(() => new Room({}));
  const { permissionsLoaded, username, userTitle, setLocalTemplate } = useParticipantStore();
  const { templateId } = Route.useParams();
  const { data: template } = useGetStreamTemplate(templateId, currentProfileAuthorization?.profileId);

  useEffect(() => {
    if (template) {
      setLocalTemplate(template, false);
    }
  }, [template, setLocalTemplate]);

  useEffect(() => {
    if (!currentProfileAuthorization?.profileId || !permissionsLoaded || !username) return;
    httpClient
      .post(`/streams/templates/${templateId}/rooms`, {
        username,
        userTitle,
        profileId: currentProfileAuthorization?.profileId,
      })
      .then(({ data }) => {
        const { token } = data;
        room.connect(getLiveKitUrl(), token);

        return () => {
          room.disconnect();
        };
      });
  }, [currentProfileAuthorization?.profileId, room, permissionsLoaded, username, userTitle, templateId]);

  return (
    <div data-lk-theme="default">
      {!permissionsLoaded && <PreJoin />}

      {permissionsLoaded && (
        <RoomContext.Provider value={room}>
          <StudioContent />
        </RoomContext.Provider>
      )}
    </div>
  );
}
