import http from 'http';
import { Server } from 'socket.io';
import app, { connectDB } from "./server";
import path from "path";
import express from "express";
import Message from './models/messages_model'; 

const PORT = process.env.PORT || 8080;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', 
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
  console.log("✅ Registering API routes before serving frontend");

  app._router.stack.forEach((route: any) => {
    if (route.route && route.route.path) {
      console.log(`Registered route: ${route.route.path}`);
    }
  });

  app.use(express.static(path.join(__dirname, "../frontend-cwc/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend-cwc/dist/index.html"));
  });

  httpServer.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
  });

}).catch((error) => {
  console.error("❌ Server failed to start:", error);
  process.exit(1);
});
