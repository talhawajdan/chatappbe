import e from "express";
import mongoose, { Types } from "mongoose";

export interface IMessage {
  content: string;
  attachments: {
    public_id: string;
    url: string;
  }[];
  sender: string;
  chat: string;
}
export interface MessageDocument extends IMessage, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
  {
    content: String,

    attachments: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
