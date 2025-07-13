import httpClient from "@/services/httpClient";
import axios from "axios";
import { round } from "lodash";
import { useCallback, useState } from "react";

export const useUploadFiles = () => {
  const [progress, setProgress] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // const { handleError } = useHandleError();

  const uploadFiles = useCallback(async (files: File[]) => {
    setTotalFiles(files.length);
    setProgress(0);
    setFilesUploaded(1);
    setIsUploading(true);
    const result: {
      url: string;
      size: number;
      name: string;
    }[] = [];

    for (const file of files) {
      try {
        const { data } = await httpClient.post<{ presignedUrl: string; remoteUrl: string }>("/uploads/presigned-url", {
          fileName: file.name,
        });

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
  }, []);

  return { progress, filesUploaded, totalFiles, isUploading, uploadFiles };
};
