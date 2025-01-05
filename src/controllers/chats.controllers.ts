import { HttpStatusCode } from "@enums/statusCode";
import chatModel from "@models/chat.model";
import messageModel from "@models/message.model";
import {
  deleteFilesFromCloudinary,
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
  uploadFilesToCloudinary,
} from "@utils/helper";
import { Request, Response } from "express";
import mongoose from "mongoose";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const GetAllChatsHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId } = req;
  const chats = await chatModel.aggregate([
    {
      $match: {
        members: new mongoose.Types.ObjectId(userId), // Check if userId is in the members array
      },
    },
    {
      $lookup: {
        from: "users", // Assuming the "users" collection contains the member details
        localField: "members", // Field in chats model
        foreignField: "_id", // Field in the users collection
        as: "members", // The array that will store the populated user data
      },
    },
    {
      $addFields: {
        members: {
          $filter: {
            input: "$members", // The array to filter
            as: "member", // The element of the array
            cond: {
              $ne: ["$$member._id", new mongoose.Types.ObjectId(userId)],
            }, // Remove member with the specified ID
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        groupChat: 1,
        "members._id": 1,
        "members.firstName": 1,
        "members.lastName": 1,
        "members.email": 1,
        "members.avatar.url": 1,
      },
    },
  ]);

  if (!chats || chats.length === 0) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "No chats found");
  }

  return sendSuccessResponse(res, HttpStatusCode.OK, "Chats found", chats);
});

const GetSingleChatHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId } = req;
  const { chatId } = req.query;
   const chats = await chatModel.aggregate([
     {
       $match: {
         members: new mongoose.Types.ObjectId(userId), 
         _id: new mongoose.Types.ObjectId(chatId as string),
       },
     },
     {
       $lookup: {
         from: "users", // Assuming the "users" collection contains the member details
         localField: "members", // Field in chats model
         foreignField: "_id", // Field in the users collection
         as: "members", // The array that will store the populated user data
       },
     },
     {
       $addFields: {
         members: {
           $filter: {
             input: "$members", // The array to filter
             as: "member", // The element of the array
             cond: {
               $ne: ["$$member._id", new mongoose.Types.ObjectId(userId)],
             }, // Remove member with the specified ID
           },
         },
       },
     },
     {
       $project: {
         name: 1,
         groupChat: 1,
         "members._id": 1,
         "members.firstName": 1,
         "members.lastName": 1,
         "members.email": 1,
         "members.avatar.url": 1,
       },
     },
     
   ]);
  if (!chats) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }
 
  return sendSuccessResponse(res, HttpStatusCode.OK, "Chat found", chats[0]);
});

const PostCreateChatHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId } = req;
  const { members, groupChat, name } = req.body;
  const allMembers = [...members, userId];
  const existingChat = await chatModel.findOne({
    groupChat: false,
    members: { $all: allMembers }, // Ensure both members are in the chat
  });
  if (existingChat) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Chat already exists"
    );
  }

  const chat = await chatModel.create({ members: allMembers, groupChat, name });
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat created successfully",
    chat
  );
});

const DeleteChatHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { chatId } = req.body;

  const chat = await chatModel.deleteOne({ _id: chatId });
  await messageModel.deleteMany({ chat: chatId });
  if (!chat) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat deleted successfully",
    chat
  );
});

export {
  GetAllChatsHandler,
  PostCreateChatHandler,
  DeleteChatHandler,
  GetSingleChatHandler,
};
