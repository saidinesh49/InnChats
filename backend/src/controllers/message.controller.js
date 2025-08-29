import { FriendsList } from "../models/friendsList.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { decryptData } from "../utils/hashService.js";

const checkFriendship = async (user1_Id, user2_Id) => {
  const friendsRes = await FriendsList.findOne({ owner: user1_Id });
  if (!(friendsRes && friendsRes?.friends?.includes(user2_Id))) {
    return null;
  }
  return true;
};

const loadMessages = asyncHandler(async (req, res) => {
  const {
    roomId,
    beforeMessageId = null,
    limit = 15,
    isEncrypted = true,
  } = req.body;
  console.log("Loading messages started", req);

  if (!roomId) throw new ApiError(400, "roomId is required");

  let decryptedData;
  if (isEncrypted) {
    decryptedData = await decryptData(roomId);
  } else {
    decryptedData = roomId;
  }

  const users = decryptedData.split("(_)");

  if (users[0] != req?.user?._id && users[1] != req?.user?._id) {
    throw new ApiError(400, "Unauthorized Access to the Chat");
  }

  const areBothFriends = await checkFriendship(users[0], users[1]);
  if (!areBothFriends) throw new ApiError(400, "Both are not Friends");

  const originalRoomId = users.sort().join("(_)");

  let query = { roomId: originalRoomId };
  if (beforeMessageId) {
    const beforeMsg = await Message.findById(beforeMessageId);
    if (beforeMsg) {
      query.createdAt = { $lt: beforeMsg.createdAt };
    }
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit || 15);

  console.log("messages fetched are:", messages);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages: messages.reverse() },
        "Messages loaded successfully"
      )
    );
});

const storeMessage = asyncHandler(async (req, res) => {
  const { roomId, senderId, message, isEncrypted = true } = req.body;

  if (!(roomId && senderId && message)) {
    throw new ApiError(400, "RoomId, senderId and message are required");
  }

  let decryptedData;
  if (isEncrypted) {
    decryptedData = await decryptData(roomId);
  } else {
    decryptedData = roomId;
  }

  const users = decryptedData.split("(_)");

  if (
    users[0] !== req?.user?._id?.toString() &&
    users[1] !== req?.user?._id?.toString()
  ) {
    throw new ApiError(400, "Unauthorized Access to the Chat");
  }

  const areBothFriends = await checkFriendship(users[0], users[1]);
  if (!areBothFriends) {
    throw new ApiError(400, "Both are not Friends");
  }

  const originalRoomId = users.sort().join("(_)");

  const newMessage = await Message.create({
    roomId: originalRoomId,
    senderId,
    message,
  });
  if (!newMessage) {
    throw new ApiError(400, "Something went wrong while storing new message");
  }

  // 👇 emit message to receiver
  const receiverId = users[0] === senderId ? users[1] : users[0];
  const io = req.app.get("io"); // get io from app context

  io.to(receiverId).emit(`message:${receiverId}`, {
    roomId,
    senderId,
    message,
    _id: newMessage._id,
    createdAt: newMessage.createdAt,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { newMessage }, "new message stored successfully")
    );
});

export { loadMessages, storeMessage };
