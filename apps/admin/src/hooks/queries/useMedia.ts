import httpClient from "@/services/httpClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Media } from "@tribe-nest/frontend-shared";
import { useUploadFiles } from "../useUploadFiles";

export const useGetMedia = (profileId?: string, parent: Media["parent"] = "website", type?: string) => {
  return useQuery<Media[]>({
    queryKey: ["media", profileId, parent, type],
    queryFn: async () => {
      const { data } = await httpClient.get(`profiles/${profileId}/media`, {
        params: {
          parent,
          type,
        },
      });
      return data;
    },
    enabled: !!profileId,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  const { uploadFiles, progress, isUploading } = useUploadFiles();

  const uploadMedia = async ({
    file,
    profileId,
    parent,
    type,
  }: {
    file: File;
    profileId: string;
    parent: Media["parent"];
    type: Media["type"];
  }) => {
    const result = await uploadFiles([file]);

    if (!result[0]) return;

    await httpClient.post(`profiles/${profileId}/media`, {
      url: result[0].url,
      size: result[0].size,
      name: result[0].name,
      parent,
      type,
    });

    queryClient.invalidateQueries({ queryKey: ["media", profileId, parent, type] });
  };

  return { uploadMedia, progress, isUploading };
};
