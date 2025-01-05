import { GetUserContactsListHandler } from "@controllers/contact.controllers";
import isAuthenticated from "@middlewares/auth";
import { Router } from "express";
const router: any = Router();

router.get("/", isAuthenticated, GetUserContactsListHandler);
export default router;