import { useState } from "react";
import { YoutubeLogo } from "../assets/youtube";
import httpClient from "@/services/httpClient";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";

export function AddYoutube() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentProfileAuthorization } = useAuth();

  if (!currentProfileAuthorization?.profileId) {
    return null;
  }

  const handleAddYoutube = async () => {
    setIsLoading(true);

    try {
      const response = await httpClient.get("/streams/oauth/youtube/url", {
        params: { profileId: currentProfileAuthorization?.profileId },
      });
      window.open(response.data, "_blank");
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to add youtube");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      onClick={isLoading ? undefined : handleAddYoutube}
      className="flex flex-col items-center justify-center cursor-pointer bg-white h-30 rounded-md hover:scale-105 transition-all duration-300"
    >
      <YoutubeLogo />
      <p className="text-gray-500">Youtube</p>
    </div>
  );
}
