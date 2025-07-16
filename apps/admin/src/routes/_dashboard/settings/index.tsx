import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormError, PaymentProviderName } from "@tribe-nest/frontend-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tribe-nest/frontend-shared";
import { Input } from "@tribe-nest/frontend-shared";
import { Label } from "@tribe-nest/frontend-shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import httpClient from "@/services/httpClient";
import { toast } from "sonner";
import { capitalize } from "lodash";

// Utility function to check if a value is masked (contains asterisks)
const isMaskedValue = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return value.includes("*");
};

// Validation schemas
const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpFrom: z.string(),
});

const r2ConfigSchema = z.object({
  r2BucketName: z.string().min(1, "R2 bucket name is required"),
  r2AccessKeyId: z.string().min(1, "R2 access key ID is required"),
  r2SecretAccessKey: z.string().min(1, "R2 secret access key is required"),
  r2Endpoint: z.string().min(1, "R2 endpoint is required"),
  r2Region: z.string().min(1, "R2 region is required"),
  r2BucketUrl: z.string().url("R2 bucket URL must be valid"),
});

const paymentConfigSchema = z.object({
  paymentProviderName: z.enum(["stripe", "paypal"]),
  paymentProviderPublicKey: z.string().min(1, "Payment provider public key is required"),
  paymentProviderPrivateKey: z.string().min(1, "Payment provider private key is required"),
});

const settingsSchema = z.object({
  email: emailConfigSchema.optional(),
  r2: r2ConfigSchema.optional(),
  payment: paymentConfigSchema.optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const Route = createFileRoute("/_dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const loadConfiguration = useCallback(async () => {
    try {
      const response = await httpClient.get(`/profiles/${currentProfileAuthorization?.profileId}/configuration`);
      setCurrentConfig(response.data);

      // Populate form with current values
      if (response.data) {
        if (response.data.smtpHost) {
          setValue("email.smtpHost", response.data.smtpHost);
          setValue("email.smtpPort", response.data.smtpPort);
          setValue("email.smtpUsername", response.data.smtpUsername);
          setValue("email.smtpPassword", response.data.smtpPassword);
          setValue("email.smtpFrom", response.data.smtpFrom);
        }

        if (response.data.r2BucketName) {
          setValue("r2.r2BucketName", response.data.r2BucketName);
          setValue("r2.r2AccessKeyId", response.data.r2AccessKeyId);
          setValue("r2.r2SecretAccessKey", response.data.r2SecretAccessKey);
          setValue("r2.r2Endpoint", response.data.r2Endpoint);
          setValue("r2.r2Region", response.data.r2Region);
          setValue("r2.r2BucketUrl", response.data.r2BucketUrl);
        }

        if (response.data.paymentProviderName) {
          setValue("payment.paymentProviderName", response.data.paymentProviderName);
          setValue("payment.paymentProviderPublicKey", response.data.paymentProviderPublicKey);
          setValue("payment.paymentProviderPrivateKey", response.data.paymentProviderPrivateKey);
        }
      }
    } catch (error) {
      console.error("Failed to load configuration:", error);
    }
  }, [currentProfileAuthorization?.profileId, setValue]);

  // Load current configuration
  useEffect(() => {
    if (currentProfileAuthorization?.profileId) {
      loadConfiguration();
    }
  }, [currentProfileAuthorization?.profileId, loadConfiguration]);

  const saveSection = async (section: "email" | "r2" | "payment") => {
    if (!currentProfileAuthorization?.profileId) return;

    // Validate the specific section
    const isValid = await trigger(section);
    if (!isValid) {
      toast.error(`Please fix the errors in the ${section} configuration`);
      return;
    }

    setIsLoading(section);
    try {
      const formData: any = {};
      const sectionData: any = {};

      // Get current form values using React Hook Form
      if (section === "email") {
        const emailValues = getValues("email");
        if (emailValues) {
          sectionData.smtpHost = emailValues.smtpHost;
          sectionData.smtpPort = emailValues.smtpPort;
          sectionData.smtpUsername = emailValues.smtpUsername;
          sectionData.smtpPassword = emailValues.smtpPassword;
          sectionData.smtpFrom = emailValues.smtpFrom;
        }
      } else if (section === "r2") {
        const r2Values = getValues("r2");
        if (r2Values) {
          sectionData.r2BucketName = r2Values.r2BucketName;
          sectionData.r2AccessKeyId = r2Values.r2AccessKeyId;
          sectionData.r2SecretAccessKey = r2Values.r2SecretAccessKey;
          sectionData.r2Endpoint = r2Values.r2Endpoint;
          sectionData.r2Region = r2Values.r2Region;
          sectionData.r2BucketUrl = r2Values.r2BucketUrl;
        }
      } else if (section === "payment") {
        const paymentValues = getValues("payment");
        if (paymentValues) {
          sectionData.paymentProviderName = paymentValues.paymentProviderName;
          sectionData.paymentProviderPublicKey = paymentValues.paymentProviderPublicKey;
          sectionData.paymentProviderPrivateKey = paymentValues.paymentProviderPrivateKey;
        }
      }

      // Filter out unchanged masked values and empty values
      Object.keys(sectionData).forEach((key) => {
        const newValue = sectionData[key];
        const currentValue = currentConfig?.[key];

        // Only include if:
        // 1. Value is not empty
        // 2. Value has changed from current value
        // 3. Value is not a masked value (unless it's actually been changed)
        if (newValue && newValue !== currentValue && !isMaskedValue(newValue)) {
          formData[section] = formData[section] || {};
          formData[section][key] = newValue;
        }
      });

      // If no changes, show a message
      if (!formData[section] || Object.keys(formData[section]).length === 0) {
        toast.info("No changes detected. Configuration remains unchanged.");
        return;
      }

      await httpClient.put(`/profiles/${currentProfileAuthorization.profileId}/configuration`, formData);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      await loadConfiguration();
    } catch (error) {
      console.error(`Failed to save ${section} settings:`, error);
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsLoading(null);
    }
  };

  const testConfiguration = async (type: string, testEmail?: string) => {
    if (!currentProfileAuthorization?.profileId) return;

    setIsTesting(type);
    try {
      let response;

      switch (type) {
        case "email":
          if (!testEmail) {
            toast.error("Please provide a test email address");
            return;
          }
          response = await httpClient.post(
            `/profiles/${currentProfileAuthorization.profileId}/configuration/test-email`,
            { testEmail, profileId: currentProfileAuthorization?.profile?.id },
          );
          break;
        case "r2":
          response = await httpClient.post(`/profiles/${currentProfileAuthorization.profileId}/configuration/test-r2`, {
            profileId: currentProfileAuthorization?.profile?.id,
          });
          break;
        case "payment":
          response = await httpClient.post(
            `/profiles/${currentProfileAuthorization.profileId}/configuration/test-payment`,
            {
              profileId: currentProfileAuthorization?.profile?.id,
            },
          );
          break;
        default:
          return;
      }

      if (response?.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error(`Failed to test ${type} configuration:`, error);
      toast.error(`Failed to test ${type} configuration`);
    } finally {
      setIsTesting(null);
    }
  };

  if (!currentProfileAuthorization?.profileId) {
    return <div>Please select a profile first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Configure your profile's email, file storage, and payment settings. You can save each section independently.
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email (SMTP)</TabsTrigger>
          <TabsTrigger value="r2">File Storage (R2)</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails from your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" {...register("email.smtpHost")} placeholder="smtp.gmail.com" />
                  {errors.email?.smtpHost && <FormError message={errors.email.smtpHost.message ?? ""} />}
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" {...register("email.smtpPort")} placeholder="587" />
                  {errors.email?.smtpPort && <FormError message={errors.email.smtpPort.message ?? ""} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input id="smtpUsername" {...register("email.smtpUsername")} placeholder="your-email@gmail.com" />
                  {errors.email?.smtpUsername && <FormError message={errors.email.smtpUsername.message ?? ""} />}
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    {...register("email.smtpPassword")}
                    placeholder="Your SMTP password"
                  />
                  {errors.email?.smtpPassword && <FormError message={errors.email.smtpPassword.message ?? ""} />}
                </div>
              </div>

              <div>
                <Label htmlFor="smtpFrom">From Email</Label>
                <Input id="smtpFrom" {...register("email.smtpFrom")} placeholder="noreply@yourdomain.com" />
                {errors.email?.smtpFrom && <FormError message={errors.email.smtpFrom.message ?? ""} />}
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={() => saveSection("email")} disabled={isLoading === "email"}>
                  {isLoading === "email" ? "Saving..." : "Save Email Settings"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const testEmail = prompt("Enter test email address:");
                    if (testEmail) {
                      testConfiguration("email", testEmail);
                    }
                  }}
                  disabled={isTesting === "email"}
                >
                  {isTesting === "email" ? "Testing..." : "Test Email Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="r2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloudflare R2 Configuration</CardTitle>
              <CardDescription>Configure Cloudflare R2 for file storage and uploads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="r2BucketName">R2 Bucket Name</Label>
                <Input id="r2BucketName" {...register("r2.r2BucketName")} placeholder="your-bucket-name" />
                {errors.r2?.r2BucketName && <FormError message={errors.r2.r2BucketName.message ?? ""} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="r2AccessKeyId">R2 Access Key ID</Label>
                  <Input id="r2AccessKeyId" {...register("r2.r2AccessKeyId")} placeholder="Your R2 access key ID" />
                  {errors.r2?.r2AccessKeyId && <FormError message={errors.r2.r2AccessKeyId.message ?? ""} />}
                </div>
                <div>
                  <Label htmlFor="r2SecretAccessKey">R2 Secret Access Key</Label>
                  <Input
                    id="r2SecretAccessKey"
                    type="password"
                    {...register("r2.r2SecretAccessKey")}
                    placeholder="Your R2 secret access key"
                  />
                  {errors.r2?.r2SecretAccessKey && <FormError message={errors.r2.r2SecretAccessKey.message ?? ""} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="r2Endpoint">R2 Endpoint</Label>
                  <Input
                    id="r2Endpoint"
                    {...register("r2.r2Endpoint")}
                    placeholder="https://your-account-id.r2.cloudflarestorage.com"
                  />
                  {errors.r2?.r2Endpoint && <FormError message={errors.r2.r2Endpoint.message ?? ""} />}
                </div>
                <div>
                  <Label htmlFor="r2Region">R2 Region</Label>
                  <Input id="r2Region" {...register("r2.r2Region")} placeholder="auto" />
                  {errors.r2?.r2Region && <FormError message={errors.r2.r2Region.message ?? ""} />}
                </div>
              </div>

              <div>
                <Label htmlFor="r2BucketUrl">R2 Bucket URL</Label>
                <Input
                  id="r2BucketUrl"
                  {...register("r2.r2BucketUrl")}
                  placeholder="https://your-bucket.your-subdomain.com"
                />
                {errors.r2?.r2BucketUrl && <FormError message={errors.r2.r2BucketUrl.message ?? ""} />}
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={() => saveSection("r2")} disabled={isLoading === "r2"}>
                  {isLoading === "r2" ? "Saving..." : "Save R2 Settings"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConfiguration("r2")}
                  disabled={isTesting === "r2"}
                >
                  {isTesting === "r2" ? "Testing..." : "Test R2 Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>Configure payment provider settings for processing payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentProviderName">Payment Provider</Label>
                <select
                  id="paymentProviderName"
                  {...register("payment.paymentProviderName")}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select payment provider</option>
                  <option value={PaymentProviderName.Stripe}>{capitalize(PaymentProviderName.Stripe)}</option>
                </select>
                {errors.payment?.paymentProviderName && (
                  <FormError message={errors.payment.paymentProviderName.message ?? ""} />
                )}
              </div>

              <div>
                <Label htmlFor="paymentProviderPublicKey">Public Key</Label>
                <Input
                  id="paymentProviderPublicKey"
                  {...register("payment.paymentProviderPublicKey")}
                  placeholder="pk_test_..."
                />
                {errors.payment?.paymentProviderPublicKey && (
                  <FormError message={errors.payment.paymentProviderPublicKey.message ?? ""} />
                )}
              </div>

              <div>
                <Label htmlFor="paymentProviderPrivateKey">Private Key</Label>
                <Input
                  id="paymentProviderPrivateKey"
                  type="password"
                  {...register("payment.paymentProviderPrivateKey")}
                  placeholder="sk_test_..."
                />
                {errors.payment?.paymentProviderPrivateKey && (
                  <FormError message={errors.payment.paymentProviderPrivateKey.message ?? ""} />
                )}
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={() => saveSection("payment")} disabled={isLoading === "payment"}>
                  {isLoading === "payment" ? "Saving..." : "Save Payment Settings"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConfiguration("payment")}
                  disabled={isTesting === "payment"}
                >
                  {isTesting === "payment" ? "Testing..." : "Test Payment Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 border rounded-lg">
        <p className="text-sm">
          <strong>Security Note:</strong> All sensitive configuration data (passwords, API keys) are encrypted before
          being stored in the database using AES-256-GCM encryption. Sensitive values are masked in the UI for security.
          You can update any field by entering a new value, or leave masked fields unchanged to preserve existing
          settings.
        </p>
      </div>
    </div>
  );
}
