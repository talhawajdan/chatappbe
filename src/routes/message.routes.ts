import { Router } from "express";
import isAuthenticated from "@middlewares/auth";
import { GetMessagesHandler } from "@controllers/messages.controllers";
import validateResource from "@middlewares/validateResource";
import { getMessagesSchema } from "@schema/messages.schema";
const router: any = Router();

router.get(
  "/",
  isAuthenticated,
  validateResource(getMessagesSchema),
  GetMessagesHandler
);

export default router;