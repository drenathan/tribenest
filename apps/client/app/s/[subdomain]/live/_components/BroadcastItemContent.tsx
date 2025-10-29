"use client";
import { LoadingState, useEditorContext } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { ILiveBroadcast } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import EndedBroadcast from "./EndedBroadcast";
import BroadcastPlayer from "./BroadcastPlayer";
import { BroadcastPassValidation } from "./BroadcastPassValidation";

export const BroadcastItemContent = () => {
  const { profile, httpClient } = useEditorContext();
  const { broadcastId } = useParams<{ broadcastId: string }>();
  const [updatedBroadcast, setUpdatedBroadcast] = useState<ILiveBroadcast | null>(null);
  const [hasValidPass, setHasValidPass] = useState(false);

  const {
    data: broadcast,
    isLoading: isBroadcastLoading,
    error,
  } = useQuery<ILiveBroadcast>({
    queryKey: ["live-broadcast", profile?.id, broadcastId],
    queryFn: async () => {
      const res = await httpClient!.get(`/public/broadcasts/${broadcastId}`, {
        params: { profileId: profile?.id },
      });
      return res.data;
    },
    enabled: !!profile?.id && !!httpClient && !!broadcastId,
  });

  useEffect(() => {
    if (!broadcastId || !profile?.id || !httpClient) return;
    const interval = setInterval(() => {
      httpClient!
        .get(`/public/broadcasts/${broadcastId}`, {
          params: { profileId: profile?.id },
        })
        .then((res) => {
          setUpdatedBroadcast(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [broadcastId, profile?.id, httpClient]);

  const needsPassValidation = !!broadcast?.eventTickets?.length;
  const hasEnded = !!updatedBroadcast?.endedAt || !!broadcast?.endedAt;
  const isPassValidated = needsPassValidation ? hasValidPass : true;

  const handlePassValidationSuccess = (sessionId: string) => {
    setHasValidPass(true);
    localStorage.setItem(`broadcast_${broadcastId}_session_id`, sessionId);
  };

  const handleLeaveBroadcast = () => {
    httpClient!
      .post(`/public/broadcasts/${broadcastId}/leave`, {
        sessionId: localStorage.getItem(`broadcast_${broadcastId}_session_id`) || undefined,
      })
      .catch(console.error);
    localStorage.removeItem(`broadcast_${broadcastId}_session_id`);
    setHasValidPass(false);
  };

  return (
    <InternalPageRenderer pagePathname="/live/[id]" backPathname="/live" onBack={handleLeaveBroadcast}>
      {isBroadcastLoading && <LoadingState />}
      {error && <div>Unable to load broadcast</div>}
      {broadcast && hasEnded && <EndedBroadcast broadcast={broadcast} />}

      {broadcast && !hasEnded && isPassValidated && <BroadcastPlayer broadcast={broadcast} />}
      {broadcast && !hasEnded && !isPassValidated && (
        <BroadcastPassValidation broadcast={broadcast} onSuccess={handlePassValidationSuccess} />
      )}
    </InternalPageRenderer>
  );
};
