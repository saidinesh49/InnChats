import { Router } from "express";
import {
  getCurrentUser,
  googleLogin,
  login,
  signup,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/current-user").post(verifyJwt, getCurrentUser);

router.route("/google-login").post(googleLogin);

export default router;
