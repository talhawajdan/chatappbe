import mongoose, { Types } from "mongoose";

export interface IChat {
  name: string;
  groupChat: boolean;
  creator: string;
  members: string[];
}
export interface ChatDocument extends IChat, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}
const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
