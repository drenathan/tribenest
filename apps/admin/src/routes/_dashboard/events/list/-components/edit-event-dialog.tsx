import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type ApiError,
  Editor,
  FormError,
} from "@tribe-nest/frontend-shared";
import { useUpdateEvent } from "@/hooks/mutations/useEvent";
import { useAuth } from "@/hooks/useAuth";
import type { IEvent } from "@/types/event";
import { toast } from "sonner";
import { countryCodes, isUSCountry } from "@/utils/countryCodes";

const editEventSchema = z.object({
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
  actionText: z.string().max(100, "Action text must be less than 100 characters").optional(),
  actionLink: z.string().optional(),
});

type EditEventInput = z.infer<typeof editEventSchema>;

type Props = {
  event: IEvent | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditEventDialog({ event, isOpen, onOpenChange }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: updateEvent, isPending } = useUpdateEvent();
  const { currentProfileAuthorization } = useAuth();

  const methods = useForm<EditEventInput>({
    resolver: zodResolver(editEventSchema),
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

  useEffect(() => {
    if (event) {
      // Format date for datetime-local input
      const date = new Date(event.dateTime);
      const formattedDate = date.toISOString().slice(0, 16);

      methods.reset({
        title: event.title,
        description: event.description || "",
        dateTime: formattedDate,
        address: {
          name: event.address.name,
          street: event.address.street,
          city: event.address.city,
          country: event.address.country,
          zipCode: event.address.zipCode || "",
        },
        actionText: event.actionText,
        actionLink: event.actionLink,
      });
    }
  }, [event, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!event || !currentProfileAuthorization?.profileId) return;

    try {
      setErrorMessage(null);
      await updateEvent({
        id: event.id,
        profileId: currentProfileAuthorization.profileId,
        ...data,
        dateTime: new Date(data.dateTime).toISOString(),
      });
      toast.success("Event updated successfully");
      onOpenChange(false);
      methods.reset();
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || "Failed to update event";
      setErrorMessage(message);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the details of your event.</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Basic Information</h4>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" {...methods.register("title")} placeholder="Enter event title" />
              {methods.formState.errors.title && (
                <div className="text-sm text-red-600 dark:text-red-400">{methods.formState.errors.title.message}</div>
              )}
            </div>
            <Controller
              control={methods.control}
              name="description"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {fieldState.error && <FormError message={fieldState.error.message as string} />}
                  <Editor initHtml={field.value ?? ""} onHtmlChange={(html) => field.onChange(html)} height="200px" />
                </div>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input id="dateTime" type="datetime-local" {...methods.register("dateTime")} />
              {methods.formState.errors.dateTime && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {methods.formState.errors.dateTime.message}
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Location</h4>

            <div className="space-y-2">
              <Label htmlFor="address.name">Location Name</Label>
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
              <Label htmlFor="address.street">Street Address</Label>
              <Input id="address.street" {...methods.register("address.street")} placeholder="Enter street address" />
              {methods.formState.errors.address?.street && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {methods.formState.errors.address.street.message}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                <Input id="address.city" {...methods.register("address.city")} placeholder="Enter city" />
                {methods.formState.errors.address?.city && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {methods.formState.errors.address.city.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
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
                <Label htmlFor="address.zipCode">Zip Code</Label>
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
          <div className="space-y-3">
            <h4 className="font-medium">Action Details</h4>

            <div className="space-y-2">
              <Label htmlFor="actionText">Action Text</Label>
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
              <Label htmlFor="actionLink">Action Link</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" onClick={onSubmit} disabled={isPending}>
              {isPending ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
