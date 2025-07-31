import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";

dotenv.config({
  path: "./src/.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is listening on port: ", process.env.PORT);
    });
    app.on("Error", (error) => {
      console.log("Express server error: ", error);
      throw error;
    });
  })
  .catch((error) => {
    console.log("MONGO_DB connection error: ", error);
  });
