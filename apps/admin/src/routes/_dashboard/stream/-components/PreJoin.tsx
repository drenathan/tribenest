import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@tribe-nest/frontend-shared";
import {
  Button,
  Input,
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tribe-nest/frontend-shared";
import { useParticipantStore } from "./store";
import { Video, MicOff, Mic, VideoOff, ChevronDown } from "lucide-react";
import Loading from "@/components/loading";

export function PreJoin() {
  const {
    audioDeviceId,
    videoDeviceId,
    audioEnabled,
    videoEnabled,
    username,
    userTitle,
    setAudioDeviceId,
    setVideoDeviceId,
    setAudioEnabled,
    setVideoEnabled,
    setUsername,
    setUserTitle,
    setPermissionsLoaded,
    setAudioDevices,
    setVideoDevices,
    audioDevices,
    videoDevices,
  } = useParticipantStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Request permissions and enumerate devices
  useEffect(() => {
    let stream: MediaStream | null = null;
    const requestPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request both audio and video permissions
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        streamRef.current = stream;

        // Set up video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter((device) => device.kind === "audioinput")
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
            kind: device.kind,
          }));

        const videoInputs = devices
          .filter((device) => device.kind === "videoinput")
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
            kind: device.kind,
          }));

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);

        // Set default devices
        if (audioInputs.length > 0) {
          setAudioDeviceId(audioInputs[0].deviceId);
        }
        if (videoInputs.length > 0) {
          setVideoDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Error requesting permissions:", err);
        setError("Failed to access camera and microphone. Please check your permissions.");
      } finally {
        setIsLoading(false);
      }
    };

    requestPermissions();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [setAudioDeviceId, setVideoDeviceId, setAudioDevices, setVideoDevices]);

  const handleAudioDeviceChange = (deviceId: string) => {
    setAudioDeviceId(deviceId);
  };

  const handleVideoDeviceChange = async (deviceId: string) => {
    setVideoDeviceId(deviceId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: { exact: deviceId } },
    });
    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const handleJoin = () => {
    setPermissionsLoaded(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />;
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-6 w-xl">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-lg font-medium">Permission Error</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-xl">
        <CardContent className="w-xl">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Preview Section */}
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full aspect-video bg-gray-900 rounded-lg object-cover"
                    style={{ display: videoEnabled ? "block" : "none" }}
                  />
                  {!videoEnabled && (
                    <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">Camera is off</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio and Video Controls */}
                <div className="flex items-center gap-4">
                  {/* Audio Control */}
                  <div className="flex items-center">
                    <Button onClick={() => setAudioEnabled(!audioEnabled)} variant="outline">
                      {audioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {audioDevices.map((device) => (
                          <DropdownMenuItem
                            key={device.deviceId}
                            onClick={() => handleAudioDeviceChange(device.deviceId)}
                            className={audioDeviceId === device.deviceId ? "bg-accent" : ""}
                          >
                            {device.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Video Control */}
                  <div className="flex items-center">
                    <Button onClick={() => setVideoEnabled(!videoEnabled)} variant="outline">
                      {videoEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {videoDevices.map((device) => (
                          <DropdownMenuItem
                            key={device.deviceId}
                            onClick={() => handleVideoDeviceChange(device.deviceId)}
                            className={videoDeviceId === device.deviceId ? "bg-accent" : ""}
                          >
                            {device.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                {/* Username Input */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="username" className="block mb-2">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Title Input */}
                  <div>
                    <Label htmlFor="title" className="block mb-2">
                      Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={userTitle}
                      onChange={(e) => setUserTitle(e.target.value)}
                      placeholder="Founder (optional)"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" onClick={handleJoin} disabled={!username.trim()}>
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
