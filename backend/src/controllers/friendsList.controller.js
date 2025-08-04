import { isValidObjectId } from "mongoose";
import { FriendsList } from "../models/friendsList.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getFriendsList = asyncHandler(async (req, res) => {
  console.log("get friendslist called");
  const friends = await FriendsList.findOne({ owner: req?.user?._id }).populate(
    "friends"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { friends: friends?.friends },
        "friends list fetched succesfuly"
      )
    );
});

const addToFriendsList = asyncHandler(async (req, res) => {
  const { newFriendId } = req.body;
  const { user } = req;
  if (!(user?._id && newFriendId)) {
    throw new ApiError(400, "Both user and friend id are required");
  }
  if (!isValidObjectId(newFriendId)) {
    throw new ApiError(400, "Invalid friend Id");
  }
  let userFriendsList = await FriendsList.findOne({ owner: user?._id });
  if (!userFriendsList?.owner) {
    userFriendsList = await FriendsList.create({
      owner: user?._id,
    });
  }

  const isAlreadyFriend = userFriendsList?.friends?.includes(newFriendId);
  if (isAlreadyFriend) {
    return res.status(200).json(new ApiResponse(201, {}, "Already friends"));
  }

  userFriendsList.friends.push(newFriendId);
  await userFriendsList.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { friends: userFriendsList },
        "New Friend Added Successfully"
      )
    );
});

export { getFriendsList, addToFriendsList };
