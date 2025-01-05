import { Request, Response } from "express";

import { HttpStatusCode } from "@enums/statusCode";
import { getUsersFriends, removeFriend } from "@services/user.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
} from "@utils/helper";
import chatModel from "@models/chat.model";
import { emitEvent } from "@utils/socket";
import { socketEvent } from "@enums/event";
import { v4 as uuid } from "uuid";
import messageModel from "@models/message.model";
interface CustomRequest extends Request {
  userId: string;
  user: any;
}

const ListOfContactsSettingsHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { search = "" }: any = req.query;
  const userId = req.userId;
  let { page = 1, limit = 10 }: any = req.query;
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;
  const { friends, total, totalPages } = await getUsersFriends(
    userId,
    skip,
    limit,
    search
  );

  const payload = {
    ...friends,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "contacts found successfully",
    payload
  );
});

const removeContactHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const userId = req.userId;
  const user = req.user;
  const { contactId }: any = req.query;
  const updateUser = await removeFriend(userId, contactId);

  if (!updateUser) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "contact not deleted Failed",
      updateUser
    );
  }
  const chat = await chatModel.findOne({
    groupChat: false,
    members: { $all: [userId, contactId] },
  });
  if (!chat) {
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "Contact removed successfully"
    );
  }
  chat.isdisabled = true;
  await chat.save();
  const messageForRealTime = {
    content: "You have been removed from the friend list This chat is disabled",
    _id: uuid(),
    chat: chat._id,
    sender: {
      _id: userId,
      name: user.name,
    },
    system: true,
    createdAt: new Date().toISOString(),
  };
  const messageForDb = {
    content: "You have been removed from the friend list This chat is disabled",
    chat: chat._id,
    sender: userId,
    system: true,
  };
  emitEvent(req, socketEvent.NewMessage, [userId, contactId], {
    chatId: chat._id,
    message: messageForRealTime,
  });
  emitEvent(req, socketEvent.refetchRequest, [userId, contactId]);

  await messageModel.create(messageForDb);
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Contact removed successfully",
    chat
  );
});

export { ListOfContactsSettingsHandler, removeContactHandler };
