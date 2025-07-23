import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCreateEmail } from "@/hooks/mutations/useEmails";
import { useGetEmailLists } from "@/hooks/queries/useEmails";
import { useGetEmailTemplates } from "@/hooks/queries/useEmails";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
} from "@tribe-nest/frontend-shared";
import { ArrowLeft, Mail } from "lucide-react";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { toast } from "sonner";
import type { ApiError } from "@tribe-nest/frontend-shared";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const emailFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    subject: z.string().min(1, "Subject is required"),
    recipientType: z.enum(["list", "email"]),
    selectedListId: z.string().optional(),
    recipientEmail: z.string().optional(),
    selectedTemplateId: z.string().min(1, "Email template is required"),
    shouldSchedule: z.boolean(),
    sendDate: z.string().optional(),
    sendTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.recipientType === "list" && !data.selectedListId) {
        return false;
      }
      if (
        data.recipientType === "email" &&
        (!data.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail))
      ) {
        return false;
      }
      if (data.shouldSchedule && (!data.sendDate || !data.sendTime)) {
        return false;
      }
      if (data.shouldSchedule && data.sendDate && data.sendTime) {
        const scheduledDateTime = new Date(`${data.sendDate}T${data.sendTime}`);
        const now = new Date();
        if (scheduledDateTime <= now) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Please check your form inputs",
    },
  );

type EmailFormData = z.infer<typeof emailFormSchema>;

export const Route = createFileRoute("/_dashboard/emails/emails/create")({
  component: CreateEmailComponent,
});

function CreateEmailComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const createEmail = useCreateEmail();

  // React Hook Form setup
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      recipientType: "list",
      selectedListId: "",
      recipientEmail: "",
      selectedTemplateId: "",
      shouldSchedule: false,
      sendDate: "",
      sendTime: "",
    },
  });

  // Fetch email lists and templates
  const { data: emailLists, isLoading: isLoadingLists } = useGetEmailLists(
    currentProfileAuthorization?.profileId,
    1,
    {},
  );

  const { data: emailTemplates, isLoading: isLoadingTemplates } = useGetEmailTemplates(
    currentProfileAuthorization?.profileId,
    1,
    {},
  );

  const watchedValues = form.watch();

  // Set default template when templates load
  useEffect(() => {
    if (emailTemplates?.data?.length && !watchedValues.selectedTemplateId) {
      form.setValue("selectedTemplateId", emailTemplates.data[0].id);
    }
  }, [emailTemplates, watchedValues.selectedTemplateId, form]);

  // Set default list when lists load
  useEffect(() => {
    if (emailLists?.data?.length && !watchedValues.selectedListId && watchedValues.recipientType === "list") {
      const defaultList = emailLists.data.find((list) => list.isDefault) || emailLists.data[0];
      form.setValue("selectedListId", defaultList.id);
    }
  }, [emailLists, watchedValues.selectedListId, watchedValues.recipientType, form]);

  const handleSubmit = async (data: EmailFormData) => {
    if (!currentProfileAuthorization?.profileId) {
      toast.error("Profile not found");
      return;
    }

    try {
      const payload = {
        profileId: currentProfileAuthorization.profileId,
        emailTemplateId: data.selectedTemplateId,
        subject: data.subject.trim(),
        title: data.title.trim(),
        ...(data.recipientType === "list"
          ? { emailListId: data.selectedListId }
          : { recipientEmail: data.recipientEmail?.trim() }),
        ...(data.shouldSchedule && data.sendDate && data.sendTime
          ? { sendDate: new Date(`${data.sendDate}T${data.sendTime}`).toISOString() }
          : {}),
      };

      await createEmail.mutateAsync(payload);
      toast.success("Email created successfully");
      navigate({ to: "/emails/emails" });
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to create email");
    }
  };

  const handleBack = () => {
    navigate({ to: "/emails/emails" });
  };

  if (isLoadingLists || isLoadingTemplates) {
    return <Loading />;
  }

  return (
    <div>
      <PageHeader
        title="Create Email"
        description="Create and schedule an email to send to your audience"
        action={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Emails
          </Button>
        }
      />

      <div className="mt-8 max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Title */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="title">Title * (For internal use only)</Label>
                <Input
                  id="title"
                  placeholder="Enter email title..."
                  {...field}
                  className={fieldState.error ? "border-red-500" : ""}
                />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* Subject */}
          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject..."
                  {...field}
                  className={fieldState.error ? "border-red-500" : ""}
                />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* Email Template */}
          <Controller
            name="selectedTemplateId"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="template">Email Template *</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={fieldState.error ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select an email template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates?.data?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* Recipient Type */}
          <Controller
            name="recipientType"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-4">
                <Label>Recipients *</Label>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="list" />
                    <Label htmlFor="list">Email List</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Individual Email</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          />

          {/* Email List Selection */}
          {watchedValues.recipientType === "list" && (
            <Controller
              name="selectedListId"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="emailList">Select Email List</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldState.error ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select an email list" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailLists?.data?.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{list.title}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({list.subscriberCount} subscribers)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                </div>
              )}
            />
          )}

          {/* Individual Email */}
          {watchedValues.recipientType === "email" && (
            <Controller
              name="recipientEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="Enter recipient email address..."
                    {...field}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                </div>
              )}
            />
          )}

          {/* Schedule Options */}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createEmail.isPending}>
              <Mail className="mr-2 h-4 w-4" />
              {watchedValues.shouldSchedule ? "Schedule Email" : "Create Email"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
