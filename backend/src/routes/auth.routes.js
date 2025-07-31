import { Router } from "express";
import { login, signup } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

export default router;
