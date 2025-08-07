import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  acceptUserReceivedRequest,
  addToFriendsList,
  getAllNonFriends,
  getAllUserRelatedRequests,
  getFriendsList,
  getUserRecievedRequests,
  getUserSentRequests,
} from "../controllers/friendsList.controller.js";

const router = Router();

router
  .route("/friends-list")
  .get(verifyJwt, getFriendsList)
  .post(verifyJwt, addToFriendsList);

router.route("/get-all-non-friends").get(verifyJwt, getAllNonFriends);

router
  .route("/requests")
  .get(verifyJwt, getAllUserRelatedRequests)
  .post(verifyJwt, acceptUserReceivedRequest);

router.route("/requests/sent").get(verifyJwt, getUserSentRequests);

router.route("/requests/recieved").get(verifyJwt, getUserRecievedRequests);

export default router;
