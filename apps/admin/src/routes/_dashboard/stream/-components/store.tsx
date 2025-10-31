import type { ApiError, IEvent } from "@tribe-nest/frontend-shared";

import type { TrackReference } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { uniqBy } from "lodash";
import type {
  IBanner,
  IStreamBroadcast,
  IStreamBroadcastComment,
  IStreamTemplate,
  ITicker,
  MediaDevice,
} from "@/types/event";
import httpClient from "@/services/httpClient";

interface ParticipantStore {
  audioDeviceId: string;
  audioEnabled: boolean;
  videoDeviceId: string;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  username: string;
  userTitle: string;
  permissionsLoaded: boolean;
  audioDevices: MediaDevice[];
  videoDevices: MediaDevice[];
  sceneTracks: TrackReference[];
  localTemplate: IStreamTemplate | null;
  comments: IStreamBroadcastComment[];
  linkedEvent: IEvent | null;
  localBroadcast: IStreamBroadcast | null;
  sceneParticipants: {
    [key: string]: {
      participant: Participant;
      tracks: TrackReference[];
    };
  };
  setAudioDeviceId: (audioDeviceId: string) => void;
  setAudioEnabled: (audioEnabled: boolean) => void;
  setVideoDeviceId: (videoDeviceId: string) => void;
  setVideoEnabled: (videoEnabled: boolean) => void;
  setScreenShareEnabled: (screenShareEnabled: boolean) => void;
  setUsername: (username: string) => void;
  setUserTitle: (userTitle: string) => void;
  setPermissionsLoaded: (permissionsLoaded: boolean) => void;
  setAudioDevices: (audioDevices: MediaDevice[]) => void;
  setVideoDevices: (videoDevices: MediaDevice[]) => void;
  setSceneTracks: (sceneTracks: TrackReference[]) => void;
  setSceneParticipants: (sceneParticipants: {
    [key: string]: { tracks: TrackReference[]; participant: Participant };
  }) => void;
  setLocalTemplate: (localTemplate: IStreamTemplate, persist?: boolean) => void;
  setLocalBroadcast: (localBroadcast: IStreamBroadcast, persist?: boolean) => void;
  setComments: (comments: IStreamBroadcastComment[]) => void;
  setLinkedEvent: (linkedEvent: IEvent | null) => void;
}

const ParticipantStoreContext = createContext<ParticipantStore | undefined>(undefined);

export function ParticipantStoreProvider({ children }: { children: ReactNode }) {
  const [audioDeviceId, setAudioDeviceIdState] = useState<string>("");
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(false);
  const [videoDeviceId, setVideoDeviceIdState] = useState<string>("");
  const [videoEnabled, setVideoEnabledState] = useState<boolean>(true);
  const [screenShareEnabled, setScreenShareEnabledState] = useState<boolean>(false);
  const [username, setUsernameState] = useState<string>(() => localStorage.getItem("stream_username") || "");
  const [userTitle, setUserTitleState] = useState<string>(() => localStorage.getItem("stream_user_title") || "");
  const [permissionsLoaded, setPermissionsLoadedState] = useState<boolean>(false);
  const [audioDevices, setAudioDevicesState] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevicesState] = useState<MediaDevice[]>([]);
  const [sceneTracks, setSceneTracksState] = useState<TrackReference[]>([]);
  const [localTemplate, setLocalTemplateState] = useState<IStreamTemplate | null>(null);
  const [comments, setCommentsState] = useState<IStreamBroadcastComment[]>([]);
  const [linkedEvent, setLinkedEventState] = useState<IEvent | null>(null);
  const [localBroadcast, setLocalBroadcastState] = useState<IStreamBroadcast | null>(null);
  const [sceneParticipants, setSceneParticipantsState] = useState<{
    [key: string]: {
      participant: Participant;
      tracks: TrackReference[];
    };
  }>({});

  const setAudioDeviceId = useCallback((audioDeviceId: string) => {
    setAudioDeviceIdState(audioDeviceId);
  }, []);

  const setAudioEnabled = useCallback((audioEnabled: boolean) => {
    setAudioEnabledState(audioEnabled);
  }, []);

  const setVideoDeviceId = useCallback((videoDeviceId: string) => {
    setVideoDeviceIdState(videoDeviceId);
  }, []);

  const setVideoEnabled = useCallback((videoEnabled: boolean) => {
    setVideoEnabledState(videoEnabled);
  }, []);

  const setScreenShareEnabled = useCallback((screenShareEnabled: boolean) => {
    setScreenShareEnabledState(screenShareEnabled);
  }, []);

  const setUsername = useCallback((username: string) => {
    setUsernameState(username);
    localStorage.setItem("stream_username", username);
  }, []);

  const setUserTitle = useCallback((userTitle: string) => {
    setUserTitleState(userTitle);
    localStorage.setItem("stream_user_title", userTitle);
  }, []);

  const setPermissionsLoaded = useCallback((permissionsLoaded: boolean) => {
    setPermissionsLoadedState(permissionsLoaded);
  }, []);

  const setAudioDevices = useCallback((audioDevices: MediaDevice[]) => {
    setAudioDevicesState(audioDevices);
  }, []);

  const setVideoDevices = useCallback((videoDevices: MediaDevice[]) => {
    setVideoDevicesState(videoDevices);
  }, []);

  const setSceneTracks = useCallback((sceneTracks: TrackReference[]) => {
    setSceneTracksState(sceneTracks);
  }, []);

  const setSceneParticipants = useCallback(
    (sceneParticipants: { [key: string]: { tracks: TrackReference[]; participant: Participant } }) => {
      setSceneParticipantsState(sceneParticipants);
    },
    [],
  );

  const setComments = useCallback((newComments: IStreamBroadcastComment[]) => {
    setCommentsState((prevComments) => uniqBy([...prevComments, ...newComments], "id"));
  }, []);

  const setLinkedEvent = useCallback((linkedEvent: IEvent | null) => {
    setLinkedEventState(linkedEvent);
  }, []);

  const setLocalTemplate = useCallback(async (localTemplate: IStreamTemplate, persist = true) => {
    setLocalTemplateState(localTemplate);

    if (persist) {
      try {
        const { data } = await httpClient.put(`/streams/templates/${localTemplate.id}`, localTemplate);
        return data;
      } catch (error) {
        const errorMessage = (error as ApiError).response?.data?.message || "Failed to update template";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  }, []);

  const setLocalBroadcast = useCallback(async (localBroadcast: IStreamBroadcast, persist = true) => {
    setLocalBroadcastState(localBroadcast);

    if (persist) {
      try {
        const { data } = await httpClient.put(`/streams/broadcasts/${localBroadcast.id}`, {
          title: localBroadcast.title,
          description: localBroadcast.description,
          thumbnailUrl: localBroadcast.thumbnailUrl,
        });
        return data;
      } catch (error) {
        const errorMessage = (error as ApiError).response?.data?.message || "Failed to update broadcast";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  }, []);

  const value: ParticipantStore = {
    audioDeviceId,
    audioEnabled,
    videoDeviceId,
    videoEnabled,
    screenShareEnabled,
    username,
    userTitle,
    permissionsLoaded,
    audioDevices,
    videoDevices,
    sceneTracks,
    localTemplate,
    comments,
    linkedEvent,
    localBroadcast,
    sceneParticipants,
    setAudioDeviceId,
    setAudioEnabled,
    setVideoDeviceId,
    setVideoEnabled,
    setScreenShareEnabled,
    setUsername,
    setUserTitle,
    setPermissionsLoaded,
    setAudioDevices,
    setVideoDevices,
    setSceneTracks,
    setSceneParticipants,
    setLocalTemplate,
    setLocalBroadcast,
    setComments,
    setLinkedEvent,
  };

  return <ParticipantStoreContext.Provider value={value}>{children}</ParticipantStoreContext.Provider>;
}

export function useParticipantStore() {
  const context = useContext(ParticipantStoreContext);
  if (context === undefined) {
    throw new Error("useParticipantStore must be used within a ParticipantStoreProvider");
  }
  return context;
}

export const sampleBanner: IBanner = {
  id: "1",
  title: "This is a test banner",
  subtitle: "This is a test banner subtitle",
};

export const sampleTicker: ITicker = {
  id: "1",
  title: "This text will scroll across the screen",
};
