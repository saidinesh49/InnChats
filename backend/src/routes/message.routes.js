import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  loadMessages,
  storeMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/store-message").post(verifyJwt, storeMessage);

router.route("/load-messages").post(verifyJwt, loadMessages);

export default router;
