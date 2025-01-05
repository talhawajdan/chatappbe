import { Request, Response } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
} from "@utils/helper";
import { HttpStatusCode } from "@enums/statusCode";
import chatModel from "@models/chat.model";
import messageModel from "@models/message.model";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const GetMessagesHandler = tryCatchWrapper(
  async (req: CustomRequest, res: Response) => {
    const { chatId = "", page = 1, limit = 20 }: any = req.query;
    const skip = (page - 1) * limit;
    const userId: any = req.userId;
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        "Chat not found"
      );
    }
    if (!chat.members.includes(userId.toString())) {
      return sendErrorResponse(res, HttpStatusCode.BadRequest, "Unauthorized");
    }
    const [messages, totalMessagesCount] = await Promise.all([
      messageModel
        .find({ chat: chatId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("sender")
        .lean(),
      messageModel.countDocuments({ chat: chatId }),
    ]);

    const totalPages = Math.ceil(totalMessagesCount / limit) || 0;

    return sendSuccessResponse(res, HttpStatusCode.OK, "Messages found", {
      messages,
      meta: {
        page,
        limit,
        totalPages,
        total: totalMessagesCount,
      },
    });
  }
);

export { GetMessagesHandler };
