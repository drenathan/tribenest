import { spawn } from "child_process";

export const spawnWebSocketToRtmpFfmpeg = (outputs: string[], cleanupFFmpeg: () => void) => {
  console.log("we are hereeeeee", outputs);
  const ffmpegProcess = spawn("ffmpeg", generateWebSocketToRtmpCommand(outputs));

  ffmpegProcess.stderr.on("data", function (d) {
    console.log("ffmpeg error", d.toString());
    // cleanupFFmpeg();
  });

  ffmpegProcess.on("error", function (e) {
    console.log("ffmpeg error", e);
    cleanupFFmpeg();
  });

  ffmpegProcess.on("exit", function (e) {
    console.log("child process exit " + e);
    cleanupFFmpeg();
  });

  ffmpegProcess.stdin.on("data", function (data) {
    console.log("ffmpeg stdin data", data.toString());
  });

  ffmpegProcess.on("close", function (e) {
    console.log("ffmpeg close", e);
    cleanupFFmpeg();
  });

  return ffmpegProcess;
};

const STREAMING_EDGE_URL = "http://127.0.0.1:4000/streams/";

export const pipeToStdoutCommand = (streamKey: string) => [
  "-i",
  `rtmp://127.0.0.1:1935/live/${streamKey}`,
  "-b:a",
  "128k",
  "-f",
  "mp3",
  "-",
];

export const generateHlsCommand = (eventId: string, streamPath: string) => [
  "-i",
  `-`,
  "-c:a", // codec audio
  "aac",
  "-b:a", // bitrate audio
  "128k",
  "-f", // format
  "hls", // HLS
  "-hls_playlist_type", // playlist type
  "event", // event
  "-segment_time", // segment time
  "4", // 4 seconds
  "-segment_list", // segment list
  "audio.m3u8",
  "-segment_format",
  "mpegts",
  "-method",
  "PUT",
  STREAMING_EDGE_URL + eventId + "/master.m3u8",
];

export const generateWebSocketToRtmpCommand = (outputs: string[]) => {
  const command = [
    // Input options (must come BEFORE -i)
    "-re", // Read input at native frame rate - MOVE THIS HERE
    "-i",
    "-", // Input from stdin

    // Video encoding settings
    "-c:v",
    "libx264", // H.264 codec
    "-preset",
    "ultrafast", // CHANGE: Much faster encoding
    "-tune",
    "zerolatency", // CHANGE: Optimize for low latency
    "-profile:v",
    "baseline", // Compatible profile
    "-level",
    "3.1",
    "-pix_fmt",
    "yuv420p",

    // Video quality
    "-b:v",
    "2000k", // Video bitrate
    "-maxrate",
    "2000k", // Max bitrate
    "-bufsize",
    "4000k", // Buffer size
    "-r",
    "30", // Frame rate
    "-g",
    "60", // GOP size

    // Audio settings
    "-c:a",
    "aac", // AAC audio codec
    "-b:a",
    "128k", // Audio bitrate
    "-ar",
    "44100", // Sample rate
    "-ac",
    "2", // Stereo

    // Error handling
    "-err_detect",
    "ignore_err",
    "-avoid_negative_ts",
    "make_zero",
    "-fflags",
    "+genpts",
    "-vsync",
    "cfr", // Constant frame rate

    // Output format
    "-f",
    "flv",
    "-flvflags",
    "no_duration_filesize",
    outputs[0],
  ];

  console.log("command", command);

  // // // Add each output with its specific settings
  // outputs.forEach((output) => {
  //   command.push(
  //     "-f",
  //     "flv", // Output format for RTMP
  //     "-flvflags",
  //     "no_duration_filesize", // FLV optimization
  //     output, // RTMP URL
  //   );
  // });

  return command;
};
