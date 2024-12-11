import { Router } from "express";
import isAuthenticated from "@middlewares/auth";
import { ListOfContactsSettingsHandler, removeContactHandler } from "@controllers/setting.controllers";
const router: any = Router();
import validateResource from "@middlewares/validateResource";
import { removeContactFromFriends } from "@schema/setting.schema";

router.get("/contacts", isAuthenticated, ListOfContactsSettingsHandler);


router.delete("/contact", isAuthenticated, validateResource(removeContactFromFriends), removeContactHandler);


export default router;