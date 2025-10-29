import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { Button } from "@tribe-nest/frontend-shared";
import { LinkIcon, Pencil, X } from "lucide-react";
import { Plus } from "lucide-react";
import { LiveIcon } from "../assets/LiveIcon";
import { Loader2 } from "lucide-react";
import SelectChannel from "../SelectChannel";
import type { IStreamBroadcast, IStreamTemplateChannel } from "@/types/event";
import { useParticipantStore } from "../store";
import { useState } from "react";
import SelectEventDialog from "./SelectEventDialog";

interface Props {
  handleBack: () => void;
  isLoadingLive: boolean;
  isLive: boolean;
  handleStopLive: () => void;
  handleGoLive: () => void;
  templateChannels: IStreamTemplateChannel[];
  isSelectChannelOpen: boolean;
  setIsSelectChannelOpen: (open: boolean) => void;
  broadcast: IStreamBroadcast | null;
}

export function StudioHeader({
  handleBack,
  isLoadingLive,
  isLive,
  isSelectChannelOpen,
  setIsSelectChannelOpen,
  handleStopLive,
  handleGoLive,
  templateChannels,
  broadcast,
}: Props) {
  const { localTemplate, linkedEvent } = useParticipantStore();
  const [isSelectEventOpen, setIsSelectEventOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-4">
        <Tooltip2 text="Close">
          <Button variant="outline" size="icon" onClick={handleBack} disabled={isLoadingLive || isLive}>
            <X className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>

        {linkedEvent ? (
          <div className="flex items-center gap-2">
            <p> Live Event: {linkedEvent.title}</p>
            <Button variant="outline" size="icon" onClick={() => setIsSelectEventOpen(true)}>
              <Pencil className="w-4 h-4 text-foreground hover:text-primary cursor-pointer" />
            </Button>
          </div>
        ) : (
          <div className="font-medium flex items-center gap-2">
            <p>{broadcast?.title || localTemplate?.title}</p>
            <Button variant="outline" size="icon">
              <Pencil className="w-4 h-4 text-foreground hover:text-primary cursor-pointer" />
            </Button>
          </div>
        )}

        {!linkedEvent && (
          <div>
            <Button variant="outline" onClick={() => setIsSelectEventOpen(true)}>
              <LinkIcon /> Link to Event
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Button variant="outline" onClick={() => setIsSelectChannelOpen(true)} disabled={isLive || isLoadingLive}>
          <Plus /> Channels
          <sup className="text-xs border border-foreground rounded-full px-2 py-1">{templateChannels?.length}</sup>
        </Button>
        {isLive && <LiveIcon />}
        <Button onClick={isLive ? handleStopLive : handleGoLive} disabled={isLoadingLive}>
          {isLive ? "Stop Live" : "Go Live"} {isLoadingLive && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </Button>
      </div>
      <SelectChannel open={isSelectChannelOpen} onOpenChange={setIsSelectChannelOpen} />
      <SelectEventDialog
        defaultSearch={linkedEvent?.title}
        open={isSelectEventOpen}
        onOpenChange={setIsSelectEventOpen}
        events={[]}
      />
    </header>
  );
}
