"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { round } from "lodash";
import { useEditorContext } from "../context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Media } from "../../../types";

type Props = {
  onImageSelect: (url: string) => void;
  value?: string;
  onRemove?: () => void;
  type?: "image" | "video";
};

export function SelectImageDialog({ onImageSelect, value, onRemove, type = "image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile, httpClient } = useEditorContext();
  const queryClient = useQueryClient();

  const { data: media } = useQuery<Media[]>({
    queryKey: ["media", profile?.id, type],
    queryFn: async () => {
      const { data } = await httpClient!.get(`profiles/${profile?.id}/media`, {
        params: {
          parent: "website",
          type,
        },
      });
      return data;
    },
    enabled: !!profile?.id && !!httpClient,
  });

  if (!profile) {
    throw new Error("profile is not initialized");
  }

  if (!httpClient) {
    throw new Error("httpClient is not initialized");
  }

  const { uploadFiles, progress, isUploading } = useUploadFiles();

  const [open, setOpen] = useState(false);

  const handleUploadImage = useCallback(
    async (file: File) => {
      const result = await uploadFiles([file]);

      if (!result[0]) return;

      await httpClient.post(`profiles/${profile.id}/media`, {
        url: result[0].url,
        size: result[0].size,
        name: result[0].name,
        parent: "website",
        type,
      });

      queryClient.invalidateQueries({ queryKey: ["media", profile.id] });
    },
    [uploadFiles, profile.id, queryClient, httpClient],
  );

  const handleImageSelect = (url: string) => {
    onImageSelect(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-2 items-center text-foreground cursor-pointer">
          {value ? (
            <>
              {type === "image" ? (
                <img src={value} alt={value} className="object-cover w-[50px] h-[50px]" />
              ) : (
                <video src={value} autoPlay loop muted playsInline className="object-cover w-[50px] h-[50px]" />
              )}
            </>
          ) : (
            <Button variant="outline">Select {type === "image" ? "Image" : "Video"}</Button>
          )}
          {value && (
            <X
              className="cursor-pointer"
              size={20}
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="min-w-[700px] min-h-[500px] overflow-hidden overflow-y-scroll text-foreground flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between mr-7 items-center shrink-0">
            Select {type === "image" ? "Image" : "Video"}
            <Button
              onClick={() => {
                inputRef.current?.click();
              }}
              variant="outline"
            >
              <Plus /> Upload new {type === "image" ? "Image" : "Video"}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isUploading && (
              <>
                <span>Uploading {type === "image" ? "Image" : "Video"} ...</span>
                <span>{progress}%</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="file"
            accept={type === "image" ? "image/*" : "video/mp4"}
            ref={inputRef}
            hidden
            onChange={(e) => {
              if (e.target?.files?.[0]) handleUploadImage(e.target?.files?.[0]);
            }}
          />

          {media?.map((m) => (
            <div
              key={m.id}
              className="flex items-center flex-col gap-4 cursor-pointer hover:scale-95 transition-all col-span-1"
              onClick={() => handleImageSelect(m.url)}
            >
              {type === "image" ? (
                <img src={m.url} alt={m.url} className="object-cover w-[100%] aspect-square" />
              ) : (
                <video src={m.url} autoPlay loop muted playsInline className="object-cover w-[100%] aspect-square" />
              )}
              <div className="flex flex-col gap-1 text-sm">
                <span>{m.name}</span>
                <span>{formatBytes(m.size)}</span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const useUploadFiles = () => {
  const [progress, setProgress] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { httpClient, profile } = useEditorContext();
  // const { handleError } = useHandleError();
  if (!httpClient) {
    throw new Error("httpClient is not initialized");
  }

  const uploadFiles = useCallback(async (files: File[]) => {
    setTotalFiles(files.length);
    setProgress(0);
    setFilesUploaded(0);
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
          profileId: profile?.id,
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
        throw error;
        // handleError("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    }

    setProgress(0);
    setFilesUploaded(0);
    setTotalFiles(0);
    setIsUploading(false);
    return result;
  }, []);

  return { progress, filesUploaded, totalFiles, isUploading, uploadFiles };
};
