import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormError, PaymentProviderName, type ApiError } from "@tribe-nest/frontend-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tribe-nest/frontend-shared";
import { Input } from "@tribe-nest/frontend-shared";
import { Label } from "@tribe-nest/frontend-shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import httpClient from "@/services/httpClient";
import { toast } from "sonner";
import { capitalize } from "lodash";
import { PWAConfigTab } from "./-components/PWAConfigTab";
import { AddressConfigTab } from "./-components/AddressConfigTab";
import { useGetProfileConfiguration } from "@/hooks/queries/useGetProfileAuthorizations";

// Validation schemas
const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpFrom: z.string().min(1, "From email is required"),
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
  paymentProviderName: z.enum(["stripe"]),
  paymentProviderPublicKey: z.string().min(1, "Payment provider public key is required"),
  paymentProviderPrivateKey: z.string().min(1, "Payment provider private key is required"),
  paymentProviderWebhookSecret: z.string().min(1, "Payment provider webhook secret is required"),
});

const settingsSchema = z.object({
  email: emailConfigSchema.optional(),
  r2: r2ConfigSchema.optional(),
  payment: paymentConfigSchema.optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const routeParams = z.object({
  tab: z.string().default("email"),
});

export const Route = createFileRoute("/_dashboard/settings/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/settings/" });
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const { data: configuration, refetch } = useGetProfileConfiguration(currentProfileAuthorization?.profileId);

  const {
    register,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (configuration) {
      reset({
        email: {
          smtpHost: configuration.smtpHost ?? "",
          smtpPort: configuration.smtpPort ?? "",
          smtpUsername: configuration.smtpUsername ?? "",
          smtpPassword: configuration.smtpPassword ?? "",
          smtpFrom: configuration.smtpFrom ?? "",
        },
        r2: {
          r2BucketName: configuration.r2BucketName ?? "",
          r2AccessKeyId: configuration.r2AccessKeyId ?? "",
          r2SecretAccessKey: configuration.r2SecretAccessKey ?? "",
          r2Endpoint: configuration.r2Endpoint ?? "",
          r2Region: configuration.r2Region ?? "",
          r2BucketUrl: configuration.r2BucketUrl ?? "",
        },
        payment: {
          paymentProviderName: configuration.paymentProviderName ?? "",
          paymentProviderPublicKey: configuration.paymentProviderPublicKey ?? "",
          paymentProviderPrivateKey: configuration.paymentProviderPrivateKey ?? "",
          paymentProviderWebhookSecret: configuration.paymentProviderWebhookSecret ?? "",
        },
      });
    }
  }, [configuration, reset]);

  const saveSection = async (section: "email" | "r2" | "payment") => {
    if (!currentProfileAuthorization?.profileId) return;

    // Validate the specific section
    const isValid = await trigger(section);
    if (!isValid) {
      return;
    }

    setIsLoading(section);
    try {
      await httpClient.put(`/profiles/${currentProfileAuthorization.profileId}/configuration`, {
        [section]: getValues(section),
      });

      toast.success(`${capitalize(section)} settings saved successfully!`);
      await refetch();
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
      toast.error(
        `Failed to test ${type} configuration: ${(error as ApiError).response?.data?.message ?? "Unknown error"}`,
      );
    } finally {
      setIsTesting(null);
    }
  };

  if (!currentProfileAuthorization?.profileId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Configure your profile's email, file storage, and payment settings. You can save each section independently.
        </p>
      </div>

      <Tabs
        value={search.tab}
        onValueChange={(value) => {
          navigate({
            to: "/settings",
            search: (prev) => ({ ...prev, tab: value }),
          });
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="email">Email (SMTP)</TabsTrigger>
          <TabsTrigger value="file">File Storage (R2)</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="pwa">App (PWA)</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
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

        <TabsContent value="file" className="space-y-4">
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

              <div>
                <Label htmlFor="paymentProviderPrivateKey">Webhook Secret</Label>
                <Input
                  id="paymentProviderWebhookSecret"
                  type="password"
                  {...register("payment.paymentProviderWebhookSecret")}
                  placeholder="whsec_..."
                />
                {errors.payment?.paymentProviderWebhookSecret && (
                  <FormError message={errors.payment.paymentProviderWebhookSecret.message ?? ""} />
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

        <TabsContent value="pwa" className="space-y-4">
          <PWAConfigTab />
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <AddressConfigTab />
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
