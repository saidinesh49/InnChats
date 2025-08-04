import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addToFriendsList,
  getFriendsList,
} from "../controllers/friendsList.controller.js";

const router = Router();

router
  .route("/friends-list")
  .get(verifyJwt, getFriendsList)
  .post(verifyJwt, addToFriendsList);

export default router;
