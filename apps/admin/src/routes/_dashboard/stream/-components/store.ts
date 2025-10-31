import httpClient from "@/services/httpClient";
import type { ApiError } from "@tribe-nest/frontend-shared";
import type {
  IBanner,
  IEvent,
  IStreamBroadcast,
  IStreamBroadcastComment,
  IStreamTemplate,
  ITicker,
  MediaDevice,
} from "@/types/event";
import type { TrackReference } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { create } from "zustand";
import { toast } from "sonner";
import { uniqBy } from "lodash";

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

export const useParticipantStore = create<ParticipantStore>((set, get) => ({
  audioDeviceId: "",
  audioEnabled: false,
  videoDeviceId: "",
  videoEnabled: true,
  linkedEvent: null,
  screenShareEnabled: false,
  username: localStorage.getItem("stream_username") || "",
  userTitle: localStorage.getItem("stream_user_title") || "",
  permissionsLoaded: false,
  audioDevices: [],
  videoDevices: [],
  sceneTracks: [],
  sceneParticipants: {},
  comments: [],
  localTemplate: null,
  localBroadcast: null,
  setComments: (newComments) => {
    const comments = get().comments;
    set({ comments: uniqBy([...comments, ...newComments], "id") });
  },
  setAudioDevices: (audioDevices) => set({ audioDevices }),
  setVideoDevices: (videoDevices) => set({ videoDevices }),
  setAudioDeviceId: (audioDeviceId) => set({ audioDeviceId }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setVideoDeviceId: (videoDeviceId) => set({ videoDeviceId }),
  setVideoEnabled: (videoEnabled) => set({ videoEnabled }),
  setScreenShareEnabled: (screenShareEnabled) => set({ screenShareEnabled }),
  setLinkedEvent: (linkedEvent) => set({ linkedEvent }),
  setUsername: (username) => {
    set({ username });
    localStorage.setItem("stream_username", username);
  },
  setUserTitle: (userTitle) => {
    set({ userTitle });
    localStorage.setItem("stream_user_title", userTitle);
  },
  setPermissionsLoaded: (permissionsLoaded) => set({ permissionsLoaded }),
  setSceneTracks: (sceneTracks) => set({ sceneTracks }),
  setSceneParticipants: (sceneParticipants) => set({ sceneParticipants }),
  setLocalTemplate: async (localTemplate, persist = true) => {
    set({ localTemplate });

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
  },

  setLocalBroadcast: async (localBroadcast, persist = true) => {
    set({ localBroadcast });

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
  },
}));

export const sampleBanner: IBanner = {
  id: "1",
  title: "This is a test banner",
  subtitle: "This is a test banner subtitle",
};

export const sampleTicker: ITicker = {
  id: "1",
  title: "This text will scroll across the screen",
};
