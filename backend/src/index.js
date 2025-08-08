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

connectDB()
  .then(() => {
    const io = new Server(server, {
      cors: {
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected: ", socket.id);

      socket.on("message:server", (data) => {});

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
