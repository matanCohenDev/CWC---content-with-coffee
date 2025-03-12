import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import app, { connectDB } from "./server";
import path from "path";
import express from "express";
import fs from 'fs';
import Message from './models/messages_model';

const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL;

const isProduction = process.env.NODE_ENV?.trim().toLowerCase() === 'production';



let server: http.Server | https.Server;

if (isProduction) {
  const options = {
    key: fs.readFileSync('/home/st111/client-key.pem'),
    cert: fs.readFileSync('/home/st111/client-cert.pem')
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('sendMessage', async (data) => {
    try {
      const savedMessage = await Message.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
      });

      const fullMessage = {
        ...data,
        _id: savedMessage._id,
        createdAt: savedMessage.createdAt,
      };

      io.emit('message', fullMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

connectDB().then(() => {
  app.use(express.static(path.join(__dirname, "../frontend-cwc/dist")));
  

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend-cwc/dist/index.html"));
  });

  server.listen(PORT, () => {
    console.log(`✅ ${isProduction ? "HTTPS" : "HTTP"} Server listening on port ${PORT}`);
  });

}).catch((error) => {
  console.error("❌ Server failed to start:", error);
  process.exit(1);
});
