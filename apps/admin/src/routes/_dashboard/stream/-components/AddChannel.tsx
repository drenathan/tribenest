import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@tribe-nest/frontend-shared";
import { AddYoutube } from "./channels/AddYoutube";
import { AddTwitch } from "./channels/AddTwitch";
import { AddCustomRtmp } from "./channels/AddCustomRtmp";

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddChannelDialog = ({ open, onOpenChange }: AddChannelDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Channel</DialogTitle>
          <DialogDescription>Add a streaming channel to stream to</DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <AddYoutube />
          <AddTwitch />
          <AddCustomRtmp onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
