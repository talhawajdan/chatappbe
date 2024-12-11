import { Router } from "express";
import isAuthenticated from "@middlewares/auth";
import { GetNotificationsHandler } from "@controllers/notifications";
const router: any = Router();

router.get("/get-notifications", isAuthenticated, GetNotificationsHandler);

export default router;