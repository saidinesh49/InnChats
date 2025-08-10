import { Router } from "express";
import {
  editProfileDetails,
  getCurrentUser,
  googleLogin,
  login,
  signup,
  updateProfilePic,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/current-user").post(verifyJwt, getCurrentUser);

router.route("/edit-details").post(verifyJwt, editProfileDetails);

router.route("/update-profile-pic").post(verifyJwt, updateProfilePic);

router.route("/google-login").post(googleLogin);

export default router;
