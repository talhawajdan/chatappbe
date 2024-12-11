import { Router } from "express";
import validateResource from "@middlewares/validateResource";
import isAuthenticated from "@middlewares/auth";
import { GetUserContactsListHandler } from "@controllers/contact.controllers";
const router: any = Router();

router.get("/", isAuthenticated, GetUserContactsListHandler);
export default router;