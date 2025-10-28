import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { spawnWebSocketToRtmpFfmpeg } from "./ffmpeg";
import { ChildProcess } from "child_process";

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  pingInterval: 60000,
  pingTimeout: 60000,
  maxHttpBufferSize: 100e6, // 100mb
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const profileId = socket.handshake.auth.profileId;

  if (!token || !profileId) {
    return next({ message: "You are not logged in", name: "UnauthorizedError" });
  }
  const destinations = [
    "rtmp://live.twitch.tv/app/live_540201758_BwgFeAeY0IrKJZaBrh6Yxa9uZ5WadM",
    "rtmp://x.rtmp.youtube.com/live2/c4tt-8aat-8zxt-ewm0-2dsk",
  ];
  socket.destinations = destinations;
  socket.profileId = profileId as string;
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");
  let ffmpegProcess: ChildProcess | null = null;
  let isStreaming = false;

  const cleanupFFmpeg = () => {
    if (ffmpegProcess) {
      console.log("Cleaning up FFmpeg process");
      try {
        if (ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
          ffmpegProcess.stdin.end();
        }
        ffmpegProcess.kill("SIGTERM");
      } catch (error) {
        console.error("Error during FFmpeg cleanup:", error);
      }
      ffmpegProcess = null;
      isStreaming = false;
    }
  };

  socket.on("prepare", async (_, cb) => {
    cb({ message: "ready" });
  });

  socket.on("binaryStream", async (data) => {
    console.log("binaryStream received", data);
    //get the size of the data in mb
    const dataSize = data.length / 1024 / 1024;
    // console.log("dataSize", dataSize, "mb");
    if (!ffmpegProcess) {
      ffmpegProcess = spawnWebSocketToRtmpFfmpeg(socket.destinations, cleanupFFmpeg);
      isStreaming = true;
    }

    ffmpegProcess.stdin?.write(data, (err) => {
      if (err) {
        console.error("Error writing to ffmpeg", err);
      } else {
        console.log("data written to ffmpeg");
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    if (ffmpegProcess) {
      ffmpegProcess.stdin?.end();
      ffmpegProcess.kill("SIGTERM");
      isStreaming = false;
      ffmpegProcess = null;
    }
  });
});

httpServer.listen(4000, () => {
  console.log(`Media server is running on port ${4000}`);
});
