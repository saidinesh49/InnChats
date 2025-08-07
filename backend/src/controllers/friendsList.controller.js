import { isValidObjectId } from "mongoose";
import { FriendsList } from "../models/friendsList.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAllUsers } from "./user.controller.js";
import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";
import mongoose from "mongoose";

const getFriendsList = asyncHandler(async (req, res) => {
  console.log("get friendslist called", req?.user);
  const friends = await FriendsList.findOne({ owner: req?.user?._id }).populate(
    "friends"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { friends: friends?.friends },
        "Friends list fetched successfully"
      )
    );
});

const addToFriendsList = asyncHandler(async (req, res) => {
  const { newFriendId } = req.body;
  const { user } = req;

  if (!(user?._id && newFriendId) || user?._id == newFriendId) {
    throw new ApiError(
      400,
      "Both user and friend id are required and should be unique"
    );
  }

  if (!isValidObjectId(newFriendId)) {
    throw new ApiError(400, "Invalid friend Id");
  }

  // Check if the other user has already sent a request
  const existingRequest = await FriendRequest.findOne({
    requestSender: newFriendId,
    requestReceiver: user._id,
  });

  if (existingRequest) {
    // Mutual request → make friends
    await FriendRequest.findByIdAndDelete(existingRequest._id);
    await FriendRequest.deleteOne({
      requestSender: user._id,
      requestReceiver: newFriendId,
    });

    // Add each other to friends list
    let userFriendsList = await FriendsList.findOne({ owner: user._id });
    if (!userFriendsList) {
      userFriendsList = await FriendsList.create({ owner: user._id });
    }

    if (!userFriendsList.friends.includes(newFriendId)) {
      userFriendsList.friends.push(newFriendId);
      await userFriendsList.save({ validateBeforeSave: false });
    }

    let otherUserFriendsList = await FriendsList.findOne({
      owner: newFriendId,
    });
    if (!otherUserFriendsList) {
      otherUserFriendsList = await FriendsList.create({ owner: newFriendId });
    }

    if (!otherUserFriendsList.friends.includes(user._id)) {
      otherUserFriendsList.friends.push(user._id);
      await otherUserFriendsList.save({ validateBeforeSave: false });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { friends: userFriendsList.friends },
          "You are now friends"
        )
      );
  } else {
    // No existing request → just send request
    const alreadySent = await FriendRequest.findOne({
      requestSender: user._id,
      requestReceiver: newFriendId,
    });

    if (!alreadySent) {
      await FriendRequest.create({
        requestSender: user._id,
        requestReceiver: newFriendId,
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Friend request sent successfully"));
  }
});

const getAllNonFriends = asyncHandler(async (req, res) => {
  console.log("get all non friends received");
  const currentUserId = req?.user?._id;
  // Fetch friend list
  const friends = await FriendsList.findOne({ owner: currentUserId });

  // Get the list of users the current user has already sent friend requests to
  const requestsSent = await FriendRequest.find({
    requestSender: currentUserId,
  }).select("requestReceiver");

  // Extract the IDs of requested users into an array
  const requestedIds = requestsSent.map((req) =>
    req.requestReceiver.toString()
  );

  // Case: user has no friends yet
  if (!friends?.owner) {
    const nonFriends = await User.find({
      _id: { $nin: [currentUserId] },
    });

    const modifiedNonFriends = nonFriends.map((user) => {
      return {
        ...user.toObject(),
        alreadyRequested: requestedIds.includes(user._id.toString()) ? 1 : 0,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { nonFriends: modifiedNonFriends },
          "Non Friends Fetched Successfully"
        )
      );
  }

  // Case: user has some friends, so exclude them and self
  const nonFriends = await User.find({
    _id: {
      $nin: [
        mongoose.Types.ObjectId(currentUserId),
        ...(friends?.friends || []),
      ],
    },
  });

  const modifiedNonFriends = nonFriends.map((user) => {
    return {
      ...user.toObject(),
      alreadyRequested: requestedIds.includes(user._id.toString()) ? 1 : 0,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { nonFriends: modifiedNonFriends },
        "Non Friends Fetched Successfully"
      )
    );
});

const getAllUserRelatedRequests = asyncHandler(async (req, res) => {
  const { user } = req;
  const sentRequests = await FriendRequest.find({
    requestSender: user?._id,
  }).populate("requestReceiver", "-password");

  const receivedRequests = await FriendRequest.find({
    requestReceiver: user?._id,
  }).populate("requestSender", "-password");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sent: sentRequests,
        received: receivedRequests,
      },
      "All user-related friend requests fetched successfully"
    )
  );
});

const acceptUserReceivedRequest = asyncHandler(async (req, res) => {
  const { user } = req;
  const { friendId } = req.body;

  const request = await FriendRequest.findOne({
    $and: [{ requestSender: friendId }, { requestReceiver: user?._id }],
  });

  if (!request || request.requestReceiver.toString() !== user._id.toString()) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, {}, "Friend request not found or not authorized")
      );
  }

  // Add each other as friends
  await FriendsList.updateOne(
    { owner: user._id },
    { $addToSet: { friends: request.requestSender } },
    { upsert: true }
  );

  await FriendsList.updateOne(
    { owner: request.requestSender },
    { $addToSet: { friends: user._id } },
    { upsert: true }
  );

  // Delete the friend request
  await FriendRequest.findByIdAndDelete(request?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend request accepted successfully"));
});

const getUserSentRequests = asyncHandler(async (req, res) => {
  const { user } = req;

  const sentRequests = await FriendRequest.find({
    requestSender: user._id,
  }).populate("requestReceiver", "_id username fullName profilePic");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sentRequests: sentRequests.map((req) => req.requestReceiver),
      },
      "Sent friend requests fetched successfully"
    )
  );
});

const getUserRecievedRequests = asyncHandler(async (req, res) => {
  const { user } = req;

  const receivedRequests = await FriendRequest.find({
    requestReceiver: user._id,
  }).populate("requestSender", "_id username fullName profilePic");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        receivedRequests: receivedRequests.map((req) => req.requestSender),
      },
      "Received friend requests fetched successfully"
    )
  );
});

export {
  getFriendsList,
  addToFriendsList,
  getAllNonFriends,
  getAllUserRelatedRequests,
  acceptUserReceivedRequest,
  getUserSentRequests,
  getUserRecievedRequests,
};
