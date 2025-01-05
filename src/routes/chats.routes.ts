import {
  DeleteChatHandler,
  GetAllChatsHandler,
  GetSingleChatHandler,
  patchUpdateGroupChatCreator,
  patchUpdateGroupChatMembers,
  patchUpdateGroupChatName,
  PostCreateChatHandler,
  PostCreateGroupChatHandler,
} from "@controllers/chats.controllers";
import isAuthenticated from "@middlewares/auth";
import validateResource from "@middlewares/validateResource";
import {
  createChat,
  CreateGroupChat,
  deleteChat,
  getASingleChat,
  UpdateGroupChatCreator,
  updateGroupChatMembers,
  UpdateGroupChatName,
} from "@schema/chat.schema";
import { Router } from "express";
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

router.post(
  "/groupChat",
  isAuthenticated,
  validateResource(CreateGroupChat),
  PostCreateGroupChatHandler
);
router.patch(
  "/updateGroupChatName",
  isAuthenticated,
  validateResource(UpdateGroupChatName),
  patchUpdateGroupChatName
);
router.patch(
  "/updateGroupChatCreator",
  isAuthenticated,
  validateResource(UpdateGroupChatCreator),
  patchUpdateGroupChatCreator
);
router.patch(
  "/updateGroupChatMembers",
  isAuthenticated,
  validateResource(updateGroupChatMembers),
  patchUpdateGroupChatMembers
);

export default router;
