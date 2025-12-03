import { Server } from "socket.io";
import http from "http";
import express from "express";
import ENV from "../ENV.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
  perMessageDeflate: {
    threshold: 1024, // only compress messages bigger than 1KB
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ to, isTyping }) => {
    const rid = to;
    const receiverSocketId = getReceiverSocketId(rid);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        userId: socket.userId,
        isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
