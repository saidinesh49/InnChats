import mongoose, { Schema } from "mongoose";

const friendsSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export const FriendsList = new mongoose.model("Friend", friendsSchema);
