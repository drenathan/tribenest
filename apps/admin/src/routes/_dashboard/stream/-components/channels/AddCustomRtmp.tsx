import { useCreateCustomRtmpChannel } from "@/hooks/mutations/useStreamTemplates";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormInput,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";

const customRtmpSchema = z.object({
  ingestUrl: z.string().url("Invalid URL"),
  title: z.string().min(1, "Title is required"),
});

type CustomRtmpFormData = z.infer<typeof customRtmpSchema>;

export function AddCustomRtmp({ onSuccess }: { onSuccess: VoidFunction }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentProfileAuthorization } = useAuth();
  const { mutateAsync: createCustomRtmpChannel, isPending } = useCreateCustomRtmpChannel();

  const { control, handleSubmit } = useForm<CustomRtmpFormData>({
    resolver: zodResolver(customRtmpSchema),
    defaultValues: {
      ingestUrl: "",
      title: "",
    },
  });

  const onSubmit = async (data: CustomRtmpFormData) => {
    if (!currentProfileAuthorization?.profileId) return;
    try {
      await createCustomRtmpChannel({
        profileId: currentProfileAuthorization?.profileId,
        ingestUrl: data.ingestUrl,
        title: data.title,
      });
      toast.success("Custom RTMP channel created successfully");
      onSuccess();
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to create custom RTMP channel");
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom RTMP</DialogTitle>
            <DialogDescription>Add a custom RTMP channel to stream to</DialogDescription>
            <div className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput name="title" label="Title" control={control} />
                <FormInput name="ingestUrl" label="Ingest URL" control={control} />
                <Button disabled={isPending} type="submit">
                  Save Channel
                </Button>
              </form>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div
        onClick={() => setIsDialogOpen(true)}
        className="flex flex-col items-center justify-center cursor-pointer bg-white h-30 rounded-md hover:scale-105 transition-all duration-300"
      >
        <p className=" border border-gray-500 rounded-md py-3 px-6 mb-2 text-black">RTMP</p>
        <p className="text-gray-500">Custom RTMP</p>
      </div>
    </>
  );
}
