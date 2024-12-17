import {
  GetUserProfileDetailsHandler,
  SearchUserHandler,
  UpdateUserProfileHandler,
  UserProfileDeleteImgHandler,
  UserProfileImgHandler,
} from "@controllers/user.controllers";
import isAuthenticated from "@middlewares/auth";
import {  updateUserSchema } from "@schema/user.schema";
import { Router } from "express";
import validateResource from "@middlewares/validateResource";
import { singleAvatarUpload } from "@middlewares/multer";

const router: any = Router();

router.get("/get-profile", isAuthenticated, GetUserProfileDetailsHandler);
router.put(
  "/update-profile",
  isAuthenticated,
  validateResource(updateUserSchema),
  UpdateUserProfileHandler
);

router.post(
  "/user-profile-img-upload",
  singleAvatarUpload,
  isAuthenticated,
  UserProfileImgHandler
);



router.delete(
  "/user-profile-img-delete",
  isAuthenticated,
  UserProfileDeleteImgHandler
);

router.get("/search", isAuthenticated, SearchUserHandler);

export default router;
