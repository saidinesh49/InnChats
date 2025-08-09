import express from "express";
import { uploadFileToAWS } from "../controllers/aws.controller.js";

const router = express.Router();
router.post("/generate-upload-url", uploadFileToAWS);

export default router;
