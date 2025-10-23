interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
import { useGetStreamChannels, useGetTemplateChannels } from "@/hooks/queries/useStreams";
import { useAuth } from "@/hooks/useAuth";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tribe-nest/frontend-shared";
import { ChannelLogos } from "./assets";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUpdateTemplateChannels } from "@/hooks/mutations/useStreamTemplates";
import { toast } from "sonner";

function SelectChannel({ open, onOpenChange }: Props) {
  const { currentProfileAuthorization } = useAuth();
  const { templateId } = useParams({ from: "/_dashboard/stream/$templateId/studio" });
  const { data: templateChannels } = useGetTemplateChannels(templateId, currentProfileAuthorization?.profileId);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const { mutateAsync: updateTemplateChannels, isPending } = useUpdateTemplateChannels();

  const { data: channels } = useGetStreamChannels(currentProfileAuthorization?.profileId);

  useEffect(() => {
    if (templateChannels) {
      setSelectedChannelIds(templateChannels.map((channel) => channel.streamChannelId));
    }
  }, [templateChannels]);

  const handleClickChannel = (channelId: string) => {
    if (selectedChannelIds.includes(channelId)) {
      setSelectedChannelIds(selectedChannelIds.filter((id) => id !== channelId));
    } else {
      setSelectedChannelIds([...selectedChannelIds, channelId]);
    }
  };

  const handleSave = async () => {
    if (!currentProfileAuthorization?.profileId) return;
    await updateTemplateChannels({
      templateId,
      profileId: currentProfileAuthorization.profileId,
      channelIds: selectedChannelIds,
    });
    toast.success("Template channels updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Channel</DialogTitle>
          <DialogDescription>Add a streaming channel to stream to</DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {channels?.data?.map((channel) => {
            const ChannelIcon = ChannelLogos[channel.channelProvider];
            const isSelected = selectedChannelIds.includes(channel.id);
            return (
              <div
                onClick={() => handleClickChannel(channel.id)}
                key={channel.id}
                className={cn(
                  "flex items-center flex-col gap-2 border border-muted-foreground rounded-md p-2 cursor-pointer hover:bg-muted-foreground/10 transition-all duration-300",
                  isSelected && "border-primary",
                )}
              >
                <div className="w-10 h-10">
                  <ChannelIcon />
                </div>
                <p>{channel.title}</p>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SelectChannel;
