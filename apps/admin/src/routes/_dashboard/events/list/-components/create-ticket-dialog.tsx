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
  Label,
  type ApiError,
  Editor,
  FormError,
  FormInput,
} from "@tribe-nest/frontend-shared";
import { useCreateTicket, useUpdateTicket } from "@/hooks/mutations/useEvent";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ITicket } from "@/types/event";

const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type CreateTicketFormInput = z.infer<typeof createTicketSchema>;

type Props = {
  eventId: string;
  ticket?: ITicket;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTicketDialog({ eventId, ticket, isOpen, onOpenChange }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: createTicket, isPending } = useCreateTicket();
  const { mutateAsync: updateTicket, isPending: isUpdating } = useUpdateTicket();
  const { currentProfileAuthorization } = useAuth();

  const methods = useForm<CreateTicketFormInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 1,
      quantity: 1,
    },
  });

  useEffect(() => {
    if (ticket) {
      methods.reset({
        title: ticket.title,
        description: ticket.description,
        price: ticket.price,
        quantity: ticket.quantity,
      });
    }
  }, [ticket, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!currentProfileAuthorization?.profileId) return;

    try {
      setErrorMessage(null);
      await (ticket
        ? updateTicket({
            ...data,
            eventId,
            ticketId: ticket.id,
            profileId: currentProfileAuthorization.profileId,
          })
        : createTicket({
            ...data,
            eventId,
            profileId: currentProfileAuthorization.profileId,
          }));
      toast.success(ticket ? "Ticket updated successfully" : "Ticket created successfully");
      onOpenChange(false);
      methods.reset();
    } catch (error) {
      const message =
        (error as ApiError).response?.data?.message || (ticket ? "Failed to update ticket" : "Failed to create ticket");
      setErrorMessage(message);
    }
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      methods.reset();
      setErrorMessage(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket ? "Edit Ticket" : "Create Ticket"}</DialogTitle>
          <DialogDescription>{ticket ? "" : "Create a new ticket for this event."}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <FormInput<CreateTicketFormInput>
            name="title"
            label="Title"
            control={methods.control}
            placeholder="Enter ticket title (e.g. General Admission)"
          />

          <Controller
            control={methods.control}
            name="description"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {fieldState.error && <FormError message={fieldState.error.message || ""} />}
                <Editor initHtml={field.value || ""} onHtmlChange={(html) => field.onChange(html)} height="200px" />
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput<CreateTicketFormInput>
              name="price"
              label="Price USD"
              control={methods.control}
              type="number"
              placeholder="Enter the ticket price"
              min={1}
            />

            <FormInput<CreateTicketFormInput>
              name="quantity"
              label="Total Quantity"
              control={methods.control}
              type="number"
              placeholder="Enter the ticket quantity"
              min={1}
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" onClick={onSubmit} disabled={isPending || isUpdating}>
              {ticket ? "Update Ticket" : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
