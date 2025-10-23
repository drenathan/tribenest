import { Card } from "@tribe-nest/frontend-shared";
import { Layers, MessageSquare, MessageSquareLock, Dock, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import ParticipantsTab from "./tabs/ParticipantsTab";
import LayersTab from "./tabs/LayersTab";
import BannersTab from "./tabs/BannersTab";
import httpClient from "@/services/httpClient";
import { useAuth } from "@/hooks/useAuth";
import { CommentsTab } from "./tabs/CommentsTab";
import { useParticipantStore } from "./store";

const buttonClass = (active: boolean) =>
  `hover:text-foreground transition-colors cursor-pointer flex flex-col items-center gap-2 pb-4 border-b border-border ${active ? "text-foreground" : "text-muted-foreground"}`;

type Tab = "participants" | "layers" | "banners" | "comments" | "guests-chat";
const tabHeadings: Record<Tab, string> = {
  participants: "Participants",
  layers: "Layers",
  banners: "Banners",
  comments: "Comments",
  "guests-chat": "Guests Chat",
};

type Props = {
  broadcastId?: string;
};

function RightPanel({ broadcastId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab | null>("participants");
  const { comments, setComments } = useParticipantStore();
  const [commentsCursor, setCommentsCursor] = useState<string>();
  const { currentProfileAuthorization } = useAuth();

  useEffect(() => {
    if (!broadcastId || !currentProfileAuthorization?.profileId) return;

    const interval = setInterval(() => {
      httpClient
        .get(`/streams/broadcasts/${broadcastId}/comments`, {
          params: {
            cursor: commentsCursor,
            profileId: currentProfileAuthorization?.profileId,
          },
        })
        .then((res) => {
          setComments(res.data);
          if (res.data.length > 0) {
            setCommentsCursor(res.data[res.data.length - 1].id);
          } else {
            setCommentsCursor(undefined);
          }
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [broadcastId, commentsCursor, currentProfileAuthorization?.profileId, setComments]);

  return (
    <div className="shrink-0 h-vh flex pt-4 px-2 gap-2">
      {activeTab && (
        <Card className="w-[340px] p-0 gap-0">
          <div className="text-sm flex justify-between items-center p-4 border-b border-border">
            <div className="text-lg font-medium">{tabHeadings[activeTab]}</div>
            <X size={24} className="cursor-pointer" onClick={() => setActiveTab(null)} />
          </div>

          <div className="p-4">
            {activeTab === "participants" && <ParticipantsTab />}
            {activeTab === "layers" && <LayersTab />}
            {activeTab === "banners" && <BannersTab />}
            {activeTab === "comments" && <CommentsTab comments={comments} />}
          </div>
        </Card>
      )}
      <Card className="text-xs text-muted-foreground px-2 self-start">
        <div className={buttonClass(activeTab === "participants")} onClick={() => setActiveTab("participants")}>
          <div>Participants</div>
          <Users size={24} />
        </div>
        <div className={buttonClass(activeTab === "layers")} onClick={() => setActiveTab("layers")}>
          <div>Layers</div>
          <Layers size={24} />
        </div>
        <div className={buttonClass(activeTab === "banners")} onClick={() => setActiveTab("banners")}>
          <div>Banners</div>
          <Dock size={24} />
        </div>
        <div className={buttonClass(activeTab === "comments")} onClick={() => setActiveTab("comments")}>
          <div>Comments</div>
          <MessageSquare size={24} />
        </div>
        <div className={buttonClass(activeTab === "guests-chat")} onClick={() => setActiveTab("guests-chat")}>
          <div>Guests Chat</div>
          <MessageSquareLock size={24} />
        </div>
      </Card>
    </div>
  );
}

export default RightPanel;
