import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@tribe-nest/frontend-shared";
import { FacebookLogo } from "./assets/facebook";
import { AddYoutube } from "./channels/AddYoutube";
import { AddTwitch } from "./channels/AddTwitch";

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
          <div className="flex flex-col items-center justify-center cursor-pointer bg-white h-30 rounded-md hover:scale-105 transition-all duration-300">
            <FacebookLogo />
            <p className="text-gray-500">Facebook</p>
          </div>
          <div className="flex flex-col items-center justify-center cursor-pointer bg-white h-30 rounded-md hover:scale-105 transition-all duration-300">
            <p className=" border border-gray-500 rounded-md py-3 px-6 mb-2 text-black">RTMP</p>
            <p className="text-gray-500">Custom RTMP</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
