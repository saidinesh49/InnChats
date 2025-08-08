import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

export const Message = new mongoose.model("Message", messageSchema);
