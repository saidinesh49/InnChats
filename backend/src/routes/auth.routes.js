import { Router } from "express";
import {
  getCurrentUser,
  login,
  signup,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/current-user").post(verifyJwt, getCurrentUser);

export default router;
