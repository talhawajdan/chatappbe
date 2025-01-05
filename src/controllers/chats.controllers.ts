import { socketEvent } from "@enums/event";
import { HttpStatusCode } from "@enums/statusCode";
import chatModel from "@models/chat.model";
import messageModel from "@models/message.model";
import UserModel from "@models/user.model";
import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
} from "@utils/helper";
import { emitEvent } from "@utils/socket";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
  user: any;
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
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $lookup: {
        from: "users", // Assuming the "users" collection contains the member details
        localField: "creator", // Field in chats model
        foreignField: "_id", // Field in the users collection
        as: "creator", // The array that will store the populated user data
      },
    },
    {
      $unwind: "$creator",
    },
    {
      $lookup: {
        from: "messages", // Ensure the collection name is correct
        let: { chatId: "$_id" }, // Pass the current chat ID to the lookup
        pipeline: [
          { $match: { $expr: { $eq: ["$chat", "$$chatId"] } } }, // Match messages for the current chat
          { $sort: { createdAt: -1 } }, // Sort messages by creation date in descending order
          { $limit: 1 },
        ],
        as: "Message",
      },
    },
    {
      $addFields: {
        latestMessage: {
          $cond: {
            if: { $gt: [{ $size: "$Message" }, 0] }, // Check if there are any messages
            then: {
              content: { $arrayElemAt: ["$Message.content", 0] },
              sender: { $arrayElemAt: ["$Message.sender", 0] }, // Include sender info if you need it
              createdAt: { $arrayElemAt: ["$Message.createdAt", 0] }, // Include sender info if you need it
            },
            else: null, // If no messages, set latestMessage to null
          },
        },
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
        latestMessage: 1,
        "members._id": 1,
        "members.firstName": 1,
        "members.lastName": 1,
        "members.email": 1,
        "members.avatar.url": 1,
        "creator._id": 1,
        "creator.firstName": 1,
        "creator.lastName": 1,
        "creator.email": 1,
        "creator.avatar.url": 1,
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
      $lookup: {
        from: "users", // Assuming the "users" collection contains the member details
        localField: "creator", // Field in chats model
        foreignField: "_id", // Field in the users collection
        as: "creator", // The array that will store the populated user data
      },
    },
    {
      $unwind: "$creator",
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
        isdisabled: 1,
        "creator._id": 1,
        "creator.firstName": 1,
        "creator.lastName": 1,
        "creator.email": 1,
        "creator.avatar.url": 1,
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

  const chat = await chatModel.create({
    members: allMembers,
    groupChat,
    name,
    creator: userId,
  });
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
  const { userId } = req;
  const chat: any = await chatModel.findOne({ _id: chatId });
  if (!chat) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }
  if (!chat.groupChat) {
    await chatModel.deleteOne({ _id: chatId });
    await messageModel.deleteMany({ chat: chatId });
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "Chat deleted successfully"
    );
  }
  if (chat.creator.toString() !== userId) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Only the creator can delete the group chat"
    );
  }
  await chatModel.deleteOne({ _id: chatId });
  await messageModel.deleteMany({ chat: chatId });
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat deleted successfully"
  );
});

const PostCreateGroupChatHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId } = req;
  const { members, name } = req.body;
  const allMembers = [...members, userId];

  const existingChat = await chatModel.findOne({
    groupChat: true,
    members: { $all: allMembers }, // Ensure all members are in the chat
  });
  if (existingChat) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Group chat already exists"
    );
  }
  if (allMembers.length < 3) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Group Chat Members cannot be less than 3"
    );
  }
  const chat = await chatModel.create({
    members: allMembers,
    groupChat: true,
    name,
    creator: userId,
  });
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Group chat created successfully",
    chat
  );
});

const patchUpdateGroupChatName = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId, user } = req;
  const { chatId, NewGroupName } = req.body;
  const chat: any = await chatModel.findOne({ _id: chatId });
  if (!chat) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }
  chat.name = NewGroupName;
  await chat.save();
  const messageForRealTime = {
    content: `Group name has been updated to ${NewGroupName} by ${user.firstName} ${user.lastName}`,
    _id: uuid(),
    chat: chat._id,
    sender: {
      _id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    system: true,
    createdAt: new Date().toISOString(),
  };
  const messageForDb = {
    content: `Group name has been updated to ${NewGroupName} by ${user.firstName} ${user.lastName}`,
    chat: chat._id,
    sender: userId,
    system: true,
  };
  emitEvent(req, socketEvent.NewMessage, chat.members, {
    chatId: chat._id,
    message: messageForRealTime,
  });
  emitEvent(req, socketEvent.refetchRequest, chat.members);
  await messageModel.create(messageForDb);

  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat Group name updated successfully",
    chat
  );
});

const patchUpdateGroupChatCreator = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId, user } = req;
  const { chatId, newCreatorId } = req.body;
  const chat: any = await chatModel.findOne({ _id: chatId });
  const creator: any = await UserModel.findById(newCreatorId);
  if (!chat) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }
  if (chat.creator.toString() !== userId) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Only the creator can update the group chat Admin"
    );
  }
  if (!chat.members.includes(newCreatorId)) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "The new creator must be a member of the group chat"
    );
  }
  chat.creator = newCreatorId;
  await chat.save();
  const messageForRealTime = {
    content: `Group Admin has been updated by ${user.firstName} ${user.lastName} to ${creator.firstName} ${creator.lastName}`,
    _id: uuid(),
    chat: chat._id,
    sender: {
      _id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    system: true,
    createdAt: new Date().toISOString(),
  };
  const messageForDb = {
    content: `Group Admin has been updated by ${user.firstName} ${user.lastName} to ${creator.firstName} ${creator.lastName}`,
    chat: chat._id,
    sender: userId,
    system: true,
  };
  emitEvent(req, socketEvent.NewMessage, chat.members, {
    chatId: chat._id,
    message: messageForRealTime,
  });
  emitEvent(req, socketEvent.refetchRequest, chat.members);
  await messageModel.create(messageForDb);
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat creator updated",
    chat
  );
});
const patchUpdateGroupChatMembers = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { userId } = req;
  const { chatId, newMembers } = req.body;
  const chat: any = await chatModel.findOne({ _id: chatId });
  const oldMembers = chat.members.map((member: any) => member.toString());
  if (!chat) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "Chat not found");
  }

  if (chat.creator.toString() !== userId) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Only the creator can update the group chat members"
    );
  }

  const user: any = await UserModel.findById(
    userId,
    "friends firstName lastName"
  );
  if (!user) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "User not found");
  }

  const allNewMembersPromise = newMembers.map((id: any) =>
    UserModel.findById(id, "firstName lastName")
  );
  const allNewMembers = await Promise.all(allNewMembersPromise);

  if (allNewMembers.includes(null)) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "One or more members do not exist"
    );
  }

  const invalidMembers = allNewMembers.filter(
    (member: any) => !user.friends.includes(member._id.toString())
  );
  if (invalidMembers.length > 0) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "One or more members are not in your friends list"
    );
  }

  const uniqueMembers = allNewMembers.map((member) => member._id);
  const membersNameList = allNewMembers
    .map((member: any) => member.firstName + " " + member.lastName)
    .join(", ");

  chat.members = [...uniqueMembers, userId];

  await chat.save();
  const messageForRealTime = {
    content: `Group members has been updated by ${user.firstName} ${user.lastName} new members are ${membersNameList} `,
    _id: uuid(),
    chat: chat._id,
    sender: {
      _id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    system: true,
    createdAt: new Date().toISOString(),
  };
  const messageForDb = {
    content: `Group members has been updated by ${user.firstName} ${user.lastName} new members are ${membersNameList}`,
    chat: chat._id,
    sender: userId,
    system: true,
  };
  emitEvent(
    req,
    socketEvent.NewMessage,
    [
      ...oldMembers,
      ...allNewMembers.map((member: any) => member._id.toString()),
    ],
    {
      chatId: chat._id,
      message: messageForRealTime,
    }
  );

  emitEvent(req, socketEvent.refetchRequest, [
    ...oldMembers,
    ...allNewMembers.map((member: any) => member._id.toString()),
  ]);
  await messageModel.create(messageForDb);

  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Chat members updated",
    chat
  );
});

export {
  DeleteChatHandler,
  GetAllChatsHandler,
  GetSingleChatHandler,
  PostCreateChatHandler,
  PostCreateGroupChatHandler,
  patchUpdateGroupChatName,
  patchUpdateGroupChatCreator,
  patchUpdateGroupChatMembers,
};
