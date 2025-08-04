import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getFriendsList } from "../controllers/friendsList.controller.js";

const router = Router();

router.route("/friends-list").post(verifyJwt, getFriendsList);

export default router;
