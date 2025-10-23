import EmptyState from "@/components/empty-state";
import Loading from "@/components/loading";
import { useGetStreamChannels } from "@/hooks/queries/useStreams";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tribe-nest/frontend-shared";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "../-components/layout/page-header";
import { AddChannelDialog } from "./-components/AddChannel";
import { toast } from "sonner";
import ChannelItem from "./-components/ChannelItem";

export const Route = createFileRoute("/_dashboard/stream/channels")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: channels, isLoading, refetch } = useGetStreamChannels(currentProfileAuthorization?.profileId);
  const isEmpty = !isLoading && !channels?.data?.length;
  const handleCreateChannel = () => {
    setIsCreateDialogOpen(true);
  };
  const handleWindowMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "oauth_error") {
        toast.error(event.data.error);
      }
      if (event.data.type === "channel_exists") {
        setIsCreateDialogOpen(false);
        toast.success("Channel already exists");
      } else if (event.data.type === "channel_created") {
        setIsCreateDialogOpen(false);
        toast.success("Channel created successfully");
        refetch();
      }
    },
    [refetch],
  );

  useEffect(() => {
    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [handleWindowMessage]);

  return (
    <div>
      <PageHeader
        title="Stream Channels"
        description="Manage your stream channels"
        action={!isEmpty && <Button onClick={handleCreateChannel}>New Channel</Button>}
      />

      {isLoading && <Loading />}

      {isEmpty && (
        <EmptyState
          title="No stream channels found"
          description={"Create a stream channel to get started"}
          action={<Button onClick={handleCreateChannel}>New Channel</Button>}
        />
      )}
      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {channels?.data?.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} />
          ))}
        </div>
      )}
      <AddChannelDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
