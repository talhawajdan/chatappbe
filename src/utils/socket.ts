import { Server, Socket } from "socket.io";
import { varifyToken } from "./helper";
import { socketEvent } from "@enums/event";
import { v4 as uuid } from "uuid";
import messageModel from "@models/message.model";

export const connectedUsers: any = {};
interface CustomSocket extends Socket {
  user?: any;
}

export const GetUserSocketId = (userIds: any) => {
  const socketIds = userIds.map((userId: any) => connectedUsers[userId]);
  return socketIds;
};
export const emitEvent = (req: any, event: any, users: any, data?: any) => {
  const io = req.app.get("io");
  const usersSocket = GetUserSocketId(users);
  io.to(usersSocket).emit(event, data);
};
const ioServer = async (server: any, app: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: false,
    },
  });
  io.use((socket: any, next) => {
    const token = socket.handshake.query.accessToken;
    if (!token) {
      return next(new Error("Authentication error:token not provided"));
    }
    try {
      const user = varifyToken(token);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Authentication error:invalid token"));
    }
  });
  io.on("connection", (socket: CustomSocket) => {
    const user = socket.user;
    connectedUsers[user._id] = socket.id;
    const users = GetUserSocketId([socket.user._id]);
    console.log("connectedUsers", connectedUsers);
    console.log("connectedUsersddd", Object.keys(connectedUsers));
    console.log("users", users);
    
    io.emit(socketEvent.onlineUsers, Object.keys(connectedUsers));
    
    socket.on(socketEvent.NewMessage, async ({ chatId, members, message }) => {
      const messageForRealTime = {
        content: message,
        latestMessage: message,
        _id: uuid(),
        sender: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        chat: chatId,
        system: false,
        createdAt: new Date().toISOString(),
      };
      const messageForDB = {
        content: message,
        sender: user._id,
        chat: chatId,
        system: false,
      };
      const membersSocket = GetUserSocketId(members);
      io.to(membersSocket).emit(socketEvent.NewMessage, {
        chatId,
        message: messageForRealTime,
      });
      io.to(membersSocket).emit(socketEvent.NewMessageAlert, {
        chatId,
        message: messageForRealTime,
    });
      try {
        await messageModel.create(messageForDB);
      } catch (error: any) {
        throw new Error(error.message);
      }
    });
    socket.on(socketEvent.typing, ({ members, chatId }) => {
      const membersSocket = GetUserSocketId(members);
      socket.to(membersSocket).emit(socketEvent.typing, { chatId });
    });
    socket.on(socketEvent.stopTyping, ({ members, chatId }) => {
      const membersSocket = GetUserSocketId(members);
      socket.to(membersSocket).emit(socketEvent.stopTyping, { chatId });
    });
    socket.on("disconnect", () => {
      delete connectedUsers[socket.user._id];
      io.emit(socketEvent.onlineUsers, Object.keys(connectedUsers));
    });
  });
  app.set("io", io);
  return io;
};

export default ioServer;
