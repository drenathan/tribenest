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
import httpClient from "@/services/httpClient";
import { toast } from "sonner";
import { countryCodes, isUSCountry, validateZipCode } from "@/utils/countryCodes";

// Dynamic validation schema for address configuration
const createAddressConfigSchema = (countryCode: string) =>
  z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: isUSCountry(countryCode)
      ? z
          .string()
          .min(5, "Zip code must be at least 5 digits")
          .regex(/^\d{5}(-\d{4})?$/, "Invalid US zip code format")
      : z.string().optional(),
    country: z.string().min(1, "Country is required"),
  });

type AddressConfigFormData = z.infer<ReturnType<typeof createAddressConfigSchema>>;

export function AddressConfigTab() {
  const { currentProfileAuthorization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<AddressConfigFormData>({
    resolver: zodResolver(createAddressConfigSchema(selectedCountry)),
  });

  const watchedCountry = watch("country");

  // Update validation schema when country changes
  useEffect(() => {
    if (watchedCountry && watchedCountry !== selectedCountry) {
      setSelectedCountry(watchedCountry);
      // Re-validate the form with new schema
      trigger();
    }
  }, [watchedCountry, selectedCountry, trigger]);

  // Load current address configuration
  useEffect(() => {
    const loadAddressConfig = async () => {
      if (!currentProfileAuthorization?.profileId) return;
      try {
        const { data } = await httpClient.get(`/profiles/${currentProfileAuthorization.profileId}/configuration`);
        if (data.address) {
          reset(data.address);
          setSelectedCountry(data.address.country || "");
        }
      } catch (error) {
        console.error("Failed to load address configuration:", error);
      }
    };

    loadAddressConfig();
  }, [currentProfileAuthorization?.profileId, reset]);

  const onSubmit = async (data: AddressConfigFormData) => {
    if (!currentProfileAuthorization?.profileId) return;

    setIsLoading(true);
    try {
      // Validate zip code for US addresses
      if (isUSCountry(data.country) && data.zipCode) {
        if (!validateZipCode(data.zipCode, data.country)) {
          toast.error("Invalid zip code format for US address");
          return;
        }
      }

      await httpClient.put(`/profiles/${currentProfileAuthorization.profileId}/configuration`, {
        address: data,
      });

      toast.success("Address configuration saved successfully!");

      // Reload configuration
      const { data: newData } = await httpClient.get(
        `/profiles/${currentProfileAuthorization.profileId}/configuration`,
      );
      if (newData.address) {
        reset(newData.address);
        setSelectedCountry(newData.address.country || "");
      }
    } catch (error) {
      console.error("Failed to save address configuration:", error);
      toast.error("Failed to save address configuration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Configuration</CardTitle>
        <CardDescription>
          Configure your profile's address information. This will be used for billing and shipping purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" {...register("street")} placeholder="123 Main Street" />
            {errors.street && <FormError message={errors.street.message || ""} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="New York" />
              {errors.city && <FormError message={errors.city.message || ""} />}
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input id="state" {...register("state")} placeholder="NY" />
              {errors.state && <FormError message={errors.state.message || ""} />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">{isUSCountry(watchedCountry) ? "Zip Code *" : "Postal Code"}</Label>
              <Input
                id="zipCode"
                {...register("zipCode")}
                placeholder={isUSCountry(watchedCountry) ? "12345" : "Postal code"}
                required={isUSCountry(watchedCountry)}
              />
              {errors.zipCode && <FormError message={errors.zipCode.message || ""} />}
              {isUSCountry(watchedCountry) && (
                <p className="text-sm text-muted-foreground mt-1">US addresses require a valid 5-digit zip code</p>
              )}
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <select id="country" {...register("country")} className="w-full p-2 border rounded-md" required>
                <option value="">Select a country</option>
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && <FormError message={errors.country.message || ""} />}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Address Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
