import { StreamChannelProvider, type IStreamChannel } from "@/types/event";
import { Card, CardContent } from "@tribe-nest/frontend-shared";
import { ChannelLogos } from "./assets";

type Props = {
  channel: IStreamChannel;
};

function ChannelItem({ channel }: Props) {
  const ChannelLogo = ChannelLogos[channel.channelProvider];
  const isCustomRTMP = channel.channelProvider === StreamChannelProvider.CustomRTMP;
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2">
        {isCustomRTMP ? (
          <ChannelLogo />
        ) : (
          <div className="h-14 w-14">
            <ChannelLogo />
          </div>
        )}
        <p className="text-center">{channel.title}</p>
      </CardContent>
    </Card>
  );
}

export default ChannelItem;
