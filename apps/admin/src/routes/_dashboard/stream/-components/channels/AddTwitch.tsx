import { useState } from "react";
import httpClient from "@/services/httpClient";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";
import { TwitchLogo } from "../assets/twitch";

export function AddTwitch() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentProfileAuthorization } = useAuth();

  if (!currentProfileAuthorization?.profileId) {
    return null;
  }

  const handleAddTwitch = async () => {
    setIsLoading(true);

    try {
      const response = await httpClient.get("/streams/oauth/twitch/url", {
        params: { profileId: currentProfileAuthorization?.profileId },
      });
      window.open(response.data, "_blank");
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to add twitch");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      onClick={isLoading ? undefined : handleAddTwitch}
      className="flex flex-col items-center justify-center cursor-pointer bg-white h-30 rounded-md hover:scale-105 transition-all duration-300"
    >
      <TwitchLogo />
      <p className="text-gray-500">Twitch</p>
    </div>
  );
}
