import httpClient from "@/services/httpClient";
import axios from "axios";
import { round } from "lodash";
import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

export const useUploadFiles = () => {
  const [progress, setProgress] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { currentProfileAuthorization } = useAuth();
  // const { handleError } = useHandleError();

  const uploadFiles = useCallback(
    async (files: (File & { id?: string })[]) => {
      setTotalFiles(files.length);
      setProgress(0);
      setFilesUploaded(1);
      setIsUploading(true);
      const result: {
        url: string;
        size: number;
        name: string;
        id?: string;
      }[] = [];

      for (const file of files) {
        try {
          if (!currentProfileAuthorization?.profileId) {
            throw new Error("Profile ID is required");
          }

          const { data } = await httpClient.post<{ presignedUrl: string; remoteUrl: string }>(
            "/uploads/presigned-url",
            {
              fileName: file.name,
              profileId: currentProfileAuthorization?.profileId,
            },
          );

          await axios.put(data.presignedUrl, file, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = round((progressEvent.loaded * 100) / (progressEvent?.total || 0));
              setProgress(percentCompleted);
            },
          });

          setFilesUploaded((prev) => prev + 1);

          result.push({
            url: data.remoteUrl,
            size: file.size,
            name: file.name,
            id: file.id,
          });
        } catch (error) {
          console.error(error);
          setIsUploading(false);
          throw error;
          // handleError("Failed to upload file");
        }
      }

      setIsUploading(false);

      setProgress(0);
      setFilesUploaded(0);
      setTotalFiles(0);
      setIsUploading(false);
      return result;
    },
    [currentProfileAuthorization?.profileId],
  );

  return { progress, filesUploaded, totalFiles, isUploading, uploadFiles };
};
