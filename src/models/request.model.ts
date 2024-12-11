import { requestStatus } from "@enums/requestStatus";
import mongoose, { Types } from "mongoose";

export interface IRequest {
  status: requestStatus.pending|requestStatus.success|requestStatus.rejected;
  sender: string;
  receiver: string;
}
export interface RequestDocument extends IRequest, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: requestStatus.pending,
      enum: [
        requestStatus.pending,
        requestStatus.success,
        requestStatus.rejected,
      ],
    },

    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
export const RequestModel = mongoose.model("Request", requestSchema);
export default Request;