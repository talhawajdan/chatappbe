import { Router } from "express";
import validateResource from "@middlewares/validateResource";
import isAuthenticated from "@middlewares/auth";
import { GetUserContactsListHandler } from "@controllers/contact.controllers";
import { DeleteChatHandler, GetAllChatsHandler, GetSingleChatHandler, PostCreateChatHandler } from "@controllers/chats.controllers";
import { createChat, deleteChat, getASingleChat } from "@schema/chat.schema";
const router: any = Router();

router.get("/", isAuthenticated, GetAllChatsHandler);
router.get(
  "/singleChat",
  isAuthenticated,
  validateResource(getASingleChat),
  GetSingleChatHandler
);
router.post(
  "/create",
  isAuthenticated,
  validateResource(createChat),
  PostCreateChatHandler
);
router.delete(
  "/delete",
  isAuthenticated,
  validateResource(deleteChat),
  DeleteChatHandler
);


export default router;
