import { useState, useEffect } from "react";
import { Form, FormProvider, useForm, useFormContext } from "react-hook-form";
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
import { useGetProfileConfiguration } from "@/hooks/queries/useGetProfileAuthorizations";

// Validation schema for PWA configuration
const pwaConfigSchema = z.object({
  name: z.string().min(1, "App name is required").max(50, "App name must be 50 characters or less"),
  shortName: z.string().min(1, "Short name is required").max(12, "Short name must be 12 characters or less"),
  description: z.string().min(1, "Description is required").max(200, "Description must be 200 characters or less"),
  icon192: z.union([
    z.instanceof(File, { message: "Icon 192x192 is required" }),
    z.string().url("Icon 192x192 is required"),
  ]),
  icon512: z.union([
    z.instanceof(File, { message: "Icon 512x512 is required" }),
    z.string().url("Icon 512x512 is required"),
  ]),
  icon96: z.union([
    z.instanceof(File, { message: "Icon 96x96 is required" }),
    z.string().url("Icon 96x96 is required"),
  ]),
  screenshotWide1280X720: z.union([
    z.instanceof(File, { message: "Wide screenshot is required" }),
    z.string().url("Wide screenshot is required"),
  ]),
  screenshotNarrow750X1334: z.union([
    z.instanceof(File, { message: "Narrow screenshot is required" }),
    z.string().url("Narrow screenshot is required"),
  ]),
});

type PWAConfigFormData = z.infer<typeof pwaConfigSchema>;

export function PWAConfigTab() {
  const { currentProfileAuthorization } = useAuth();
  const { uploadFiles, isUploading } = useUploadFiles();
  const [isLoading, setIsLoading] = useState(false);

  const { data: configuration } = useGetProfileConfiguration(currentProfileAuthorization?.profileId);

  const methods = useForm<PWAConfigFormData>({
    resolver: zodResolver(pwaConfigSchema),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    if (configuration?.pwaConfig) {
      reset(configuration.pwaConfig);
    }
  }, [configuration, reset]);

  const onSubmit = async (data: PWAConfigFormData) => {
    if (!currentProfileAuthorization?.profileId) return;
    const filesKeys: (keyof PWAConfigFormData)[] = [
      "icon192",
      "icon512",
      "icon96",
      "screenshotWide1280X720",
      "screenshotNarrow750X1334",
    ];

    setIsLoading(true);
    try {
      const filesToUpload = filesKeys
        .map((key) => {
          if (data[key] instanceof File) {
            return Object.assign(data[key], { id: key as string });
          }
          return null;
        })
        .filter((file) => file !== null);

      const uploadedFiles = await uploadFiles(filesToUpload);

      const updatedData = {
        ...data,
        icon192: uploadedFiles.find((file) => file.id === "icon192")?.url ?? data.icon192,
        icon512: uploadedFiles.find((file) => file.id === "icon512")?.url ?? data.icon512,
        icon96: uploadedFiles.find((file) => file.id === "icon96")?.url ?? data.icon96,
        screenshotWide1280X720:
          uploadedFiles.find((file) => file.id === "screenshotWide1280X720")?.url ?? data.screenshotWide1280X720,
        screenshotNarrow750X1334:
          uploadedFiles.find((file) => file.id === "screenshotNarrow750X1334")?.url ?? data.screenshotNarrow750X1334,
      };

      await httpClient.put(`/profiles/${currentProfileAuthorization.profileId}/configuration`, {
        pwa: updatedData,
      });

      toast.success("PWA configuration saved successfully!");
    } catch (error) {
      console.error("Failed to save PWA configuration:", error);
      toast.error("Failed to save PWA configuration");
    } finally {
      setIsLoading(false);
    }
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
        <FormProvider {...methods}>
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

            <div className="flex flex-col gap-8 mb-8">
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

            <div className="flex flex-col gap-8">
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
        </FormProvider>
      </CardContent>
    </Card>
  );
}

const FileUploadField = ({
  field,
  label,
}: {
  field: keyof PWAConfigFormData;
  label: string;
  description: string;
  dimensions: string;
}) => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const fieldValue = watch(field);

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

  const handleFileChange = async (field: string, file: File) => {
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

    setValue(field, file);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input
        placeholder="Upload file"
        type="file"
        accept={".jpg,.jpeg,.png"}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileChange(field, e.target.files[0]);
          }
        }}
      />
      {errors[field] && <FormError message={(errors[field]?.message as string) ?? ""} />}

      {fieldValue && (
        <img
          src={fieldValue instanceof File ? URL.createObjectURL(fieldValue) : fieldValue}
          alt={label}
          className="w-30 object-cover "
        />
      )}
    </div>
  );
};
