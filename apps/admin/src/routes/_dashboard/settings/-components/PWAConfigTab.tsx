import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  FormError,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import httpClient from "@/services/httpClient";
import { toast } from "sonner";
import { Upload, X, CheckCircle } from "lucide-react";

// Validation schema for PWA configuration
const pwaConfigSchema = z.object({
  name: z.string().min(1, "App name is required").max(50, "App name must be 50 characters or less"),
  shortName: z.string().min(1, "Short name is required").max(12, "Short name must be 12 characters or less"),
  description: z.string().min(1, "Description is required").max(200, "Description must be 200 characters or less"),
  icon192: z.string().optional(),
  icon512: z.string().optional(),
  icon96: z.string().optional(),
  screenshotWide1280X720: z.string().optional(),
  screenshotNarrow750X1334: z.string().optional(),
});

type PWAConfigFormData = z.infer<typeof pwaConfigSchema>;

interface FileUploadState {
  icon192: File | null;
  icon512: File | null;
  icon96: File | null;
  screenshotWide1280X720: File | null;
  screenshotNarrow750X1334: File | null;
}

export function PWAConfigTab() {
  const { currentProfileAuthorization } = useAuth();
  const { uploadFiles, isUploading } = useUploadFiles();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUploadState>({
    icon192: null,
    icon512: null,
    icon96: null,
    screenshotWide1280X720: null,
    screenshotNarrow750X1334: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PWAConfigFormData>({
    resolver: zodResolver(pwaConfigSchema),
  });

  // Load current PWA configuration
  useEffect(() => {
    const loadPWAConfig = async () => {
      if (!currentProfileAuthorization?.profileId) return;
      try {
        const { data } = await httpClient.get(`/profiles/${currentProfileAuthorization.profileId}/configuration`);
        if (data.pwa) {
          reset(data.pwa);
        }
      } catch (error) {
        console.error("Failed to load PWA configuration:", error);
      }
    };

    loadPWAConfig();
  }, [currentProfileAuthorization?.profileId, reset]);

  const validateImageDimensions = (file: File, expectedWidth: number, expectedHeight: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const isValid = img.width === expectedWidth && img.height === expectedHeight;
        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  };

  const handleFileChange = async (field: keyof FileUploadState, file: File | null) => {
    if (!file) {
      setFileUploads((prev) => ({ ...prev, [field]: null }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(`${field} must be an image file`);
      return;
    }

    // Validate dimensions based on field
    let isValidDimensions = true;
    switch (field) {
      case "icon192":
        isValidDimensions = await validateImageDimensions(file, 192, 192);
        break;
      case "icon512":
        isValidDimensions = await validateImageDimensions(file, 512, 512);
        break;
      case "icon96":
        isValidDimensions = await validateImageDimensions(file, 96, 96);
        break;
      case "screenshotWide1280X720":
        isValidDimensions = await validateImageDimensions(file, 1280, 720);
        break;
      case "screenshotNarrow750X1334":
        isValidDimensions = await validateImageDimensions(file, 750, 1334);
        break;
    }

    if (!isValidDimensions) {
      toast.error(`${field} has incorrect dimensions`);
      return;
    }

    setFileUploads((prev) => ({ ...prev, [field]: file }));
  };

  const onSubmit = async (data: PWAConfigFormData) => {
    if (!currentProfileAuthorization?.profileId) return;

    setHasAttemptedSubmit(true);

    // Validate that required files are either uploaded or already exist
    const requiredFields = ["icon192", "icon512", "icon96", "screenshotWide1280X720", "screenshotNarrow750X1334"];
    const missingFields = requiredFields.filter((field) => {
      const hasFile = fileUploads[field as keyof FileUploadState];
      const hasExistingValue = data[field as keyof PWAConfigFormData];
      return !hasFile && !hasExistingValue;
    });

    if (missingFields.length > 0) {
      toast.error(`Please upload the following required files: ${missingFields.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      // Upload all files first
      const filesToUpload = Object.values(fileUploads).filter(Boolean) as File[];
      let uploadedFiles: { url: string; name: string }[] = [];

      if (filesToUpload.length > 0) {
        uploadedFiles = await uploadFiles(filesToUpload);
      }

      // Map uploaded files to form data
      const updatedData = { ...data };
      uploadedFiles.forEach((file) => {
        const fieldName = Object.keys(fileUploads).find(
          (key) => fileUploads[key as keyof FileUploadState]?.name === file.name,
        );
        if (fieldName) {
          (updatedData as any)[fieldName] = file.url;
        }
      });

      // Save PWA configuration
      await httpClient.put(`/profiles/${currentProfileAuthorization.profileId}/configuration`, {
        pwa: updatedData,
      });

      toast.success("PWA configuration saved successfully!");

      // Clear file uploads
      setFileUploads({
        icon192: null,
        icon512: null,
        icon96: null,
        screenshotWide1280X720: null,
        screenshotNarrow750X1334: null,
      });

      // Reload configuration
      const { data: newData } = await httpClient.get(
        `/profiles/${currentProfileAuthorization.profileId}/configuration`,
      );
      if (newData.pwa) {
        reset(newData.pwa);
      }
    } catch (error) {
      console.error("Failed to save PWA configuration:", error);
      toast.error("Failed to save PWA configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadField = ({
    field,
    label,
    description,
    dimensions,
  }: {
    field: keyof FileUploadState;
    label: string;
    description: string;
    dimensions: string;
  }) => {
    const currentFile = fileUploads[field];
    const currentValue = watch(field);

    // Check if field is required but missing (only show error after submit attempt)
    const isRequired = ["icon192", "icon512", "icon96", "screenshotWide1280X720", "screenshotNarrow750X1334"].includes(
      field,
    );
    const isMissing = isRequired && !currentFile && !currentValue && hasAttemptedSubmit;

    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <p className="text-sm text-muted-foreground">
          {description} ({dimensions})
        </p>

        <div className="flex items-center gap-2">
          <input
            type="file"
            id={field}
            accept="image/*"
            onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(field)?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {currentFile ? "Change File" : "Upload File"}
          </Button>

          {currentFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              {currentFile.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFileChange(field, null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {currentValue && !currentFile && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <CheckCircle className="w-4 h-4" />
              Current file uploaded
            </div>
          )}
        </div>

        {isMissing && <FormError message={`${label} is required`} />}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PWA Configuration</CardTitle>
        <CardDescription>
          Configure your Progressive Web App settings. This will enable users to install your website as an app on their
          devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">App Name</Label>
              <Input id="name" {...register("name")} placeholder="My Awesome App" />
              {errors.name && <FormError message={errors.name.message || ""} />}
            </div>

            <div>
              <Label htmlFor="shortName">Short Name</Label>
              <Input id="shortName" {...register("shortName")} placeholder="MyApp" />
              {errors.shortName && <FormError message={errors.shortName.message || ""} />}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="A brief description of your app" />
            {errors.description && <FormError message={errors.description.message || ""} />}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">App Icons</h3>

            <FileUploadField
              field="icon192"
              label="Icon 192x192"
              description="Square icon for Android devices"
              dimensions="192x192px"
            />

            <FileUploadField
              field="icon512"
              label="Icon 512x512"
              description="Square icon for Android devices (high resolution)"
              dimensions="512x512px"
            />

            <FileUploadField
              field="icon96"
              label="Icon 96x96"
              description="Square icon for smaller displays"
              dimensions="96x96px"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">App Screenshots</h3>

            <FileUploadField
              field="screenshotWide1280X720"
              label="Wide Screenshot"
              description="Landscape screenshot for app stores"
              dimensions="1280x720px"
            />

            <FileUploadField
              field="screenshotNarrow750X1334"
              label="Narrow Screenshot"
              description="Portrait screenshot for app stores"
              dimensions="750x1334px"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? "Saving..." : "Save PWA Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
