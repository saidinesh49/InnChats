import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addToFriendsList,
  getAllNonFriends,
  getFriendsList,
} from "../controllers/friendsList.controller.js";

const router = Router();

router
  .route("/friends-list")
  .get(verifyJwt, getFriendsList)
  .post(verifyJwt, addToFriendsList);

router.route("/get-all-non-friends").get(verifyJwt, getAllNonFriends);

export default router;
