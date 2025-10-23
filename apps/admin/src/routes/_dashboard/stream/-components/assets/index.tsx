import type { StreamChannelProvider } from "@/types/event";
import CustomRTMP from "./custom";
import YoutubeIcon from "./youtubeIcon";
import TwitchIcon from "./TwitchIcon";

export const ChannelLogos: Record<StreamChannelProvider, React.FC> = {
  youtube: YoutubeIcon,
  twitch: TwitchIcon,
  custom_rtmp: CustomRTMP,
};
