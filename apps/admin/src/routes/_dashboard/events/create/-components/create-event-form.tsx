import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tribe-nest/frontend-shared";
import { useCreateEvent } from "@/hooks/mutations/useEvent";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { countryCodes, isUSCountry } from "@/utils/countryCodes";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  address: z
    .object({
      name: z.string().min(1, "Location name is required"),
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      country: z.string().min(1, "Country is required"),
      zipCode: z.string().optional(),
    })
    .refine(
      (data) => {
        if (isUSCountry(data.country) && !data.zipCode) {
          return false;
        }
        return true;
      },
      {
        message: "Zip code is required for USA addresses",
        path: ["zipCode"],
      },
    ),
  actionText: z.string().min(1, "Action text is required").max(100, "Action text must be less than 100 characters"),
  actionLink: z.string().url("Action link must be a valid URL"),
});

type CreateEventInput = z.infer<typeof createEventSchema>;

export function CreateEventForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: createEvent, isPending } = useCreateEvent();
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();

  const methods = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      dateTime: "",
      address: {
        name: "",
        street: "",
        city: "",
        country: "",
        zipCode: "",
      },
      actionText: "",
      actionLink: "",
    },
  });

  const selectedCountry = methods.watch("address.country");

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!currentProfileAuthorization?.profileId) return;

    try {
      setErrorMessage(null);
      await createEvent({
        ...data,
        dateTime: new Date(data.dateTime).toISOString(),
        profileId: currentProfileAuthorization.profileId,
      });
      toast.success("Event created successfully");
      navigate({ to: "/events/list" });
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Failed to create event");
    }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Event
          </CardTitle>
          <CardDescription>Fill in the details below to create a new event for your community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input id="title" {...methods.register("title")} placeholder="Enter event title" />
                {methods.formState.errors.title && (
                  <div className="text-sm text-red-600 dark:text-red-400">{methods.formState.errors.title.message}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...methods.register("description")}
                  placeholder="Enter event description (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTime">Date & Time *</Label>
                <Input id="dateTime" type="datetime-local" {...methods.register("dateTime")} />
                {methods.formState.errors.dateTime && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.dateTime.message}
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address.name">Location Name *</Label>
                <Input
                  id="address.name"
                  {...methods.register("address.name")}
                  placeholder="e.g., Conference Center, Park, etc."
                />
                {methods.formState.errors.address?.name && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.address.name.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.street">Street Address *</Label>
                <Input id="address.street" {...methods.register("address.street")} placeholder="Enter street address" />
                {methods.formState.errors.address?.street && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.address.street.message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.city">City *</Label>
                  <Input id="address.city" {...methods.register("address.city")} placeholder="Enter city" />
                  {methods.formState.errors.address?.city && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {methods.formState.errors.address.city.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.country">Country *</Label>
                  <Select value={selectedCountry} onValueChange={(value) => methods.setValue("address.country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {methods.formState.errors.address?.country && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {methods.formState.errors.address.country.message}
                    </div>
                  )}
                </div>
              </div>

              {isUSCountry(selectedCountry) && (
                <div className="space-y-2">
                  <Label htmlFor="address.zipCode">Zip Code *</Label>
                  <Input id="address.zipCode" {...methods.register("address.zipCode")} placeholder="Enter zip code" />
                  {methods.formState.errors.address?.zipCode && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {methods.formState.errors.address.zipCode.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Action Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="actionText">Action Text *</Label>
                <Input
                  id="actionText"
                  {...methods.register("actionText")}
                  placeholder="e.g., Register Now, Learn More, etc."
                />
                {methods.formState.errors.actionText && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.actionText.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionLink">Action Link *</Label>
                <Input id="actionLink" {...methods.register("actionLink")} placeholder="https://example.com/register" />
                {methods.formState.errors.actionLink && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.actionLink.message}
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/events/list" })}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
