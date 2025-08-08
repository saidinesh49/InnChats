import { FriendsList } from "../models/friendsList.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkFriendship = async (user1_Id, user2_Id) => {
  const friendsRes = await FriendsList.findOne({ owner: user1_Id });
  if (!(friendsRes && friendsRes?.friends?.includes(user2_Id))) {
    return null;
  }
  return true;
};

const loadMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    throw new ApiError(400, "roomId is required");
  }
  const users = roomId.split("_");
  if (users[0] != req?.user?._id && users[1] != req?.user?._id) {
    throw new ApiError(400, "Unauthorized Access to the Chat");
  }

  const areBothFriends = await checkFriendship(users[0], users[1]);
  if (!areBothFriends) {
    console.log("friends relation:", areBothFriends);
    throw new ApiError(400, "Both are not Friends");
  }
  const messages = await Message.find({ roomId: roomId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages: messages },
        "Messages loaded Successfuly"
      )
    );
});

const storeMessage = asyncHandler(async (req, res) => {
  const { roomId, senderId, message } = req.body;
  const users = roomId.split("_");
  if (users[0] != req?.user?._id && users[1] != req?.user?._id) {
    throw new ApiError(400, "Unauthorized Access to the Chat");
  }
  const areBothFriends = await checkFriendship(users[0], users[1]);
  if (!areBothFriends) {
    throw new ApiError(400, "Both are not Friends");
  }

  const newMessage = await Message.create({
    roomId: roomId,
    senderId: senderId,
    message: message,
  });

  if (!newMessage) {
    throw new ApiError(
      400,
      "Something went wrong while creating and storing new message"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { newMessage }, "new message stored successfuly")
    );
});
export { loadMessages, storeMessage };
