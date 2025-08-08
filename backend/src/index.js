import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config({
  path: "./src/.env",
});

const server = http.createServer(app);

// 👇 expose io for use in controllers
let io;

connectDB()
  .then(() => {
    io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:4200",
          process.env.FRONTEND_URL,
          "https://innchats.vercel.app",
        ],
        methods: ["GET", "POST"],
      },
    });

    // 👇 store io instance in app so we can use it in routes/controllers
    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("Socket connected: ", socket.id);

      // Join the user to a room with their userId
      socket.on("register", (userId) => {
        socket.join(userId); // join private room
        console.log(`User ${userId} joined their room`);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected: ", socket.id);
      });
    });

    server.listen(process.env.PORT || 8000, () => {
      console.log("Server is listening on port:", process.env.PORT);
    });

    app.on("error", (err) => {
      console.error("Express server error:", err);
      throw err;
    });
  })
  .catch((error) => {
    console.log("MONGO_DB connection error: ", error);
  });
