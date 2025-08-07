import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema({
  requestSender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestReceiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const FriendRequest = new mongoose.model(
  "FriendRequest",
  friendRequestSchema
);
