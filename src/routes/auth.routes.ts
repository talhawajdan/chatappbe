import { Router } from "express";
import { createUserHandler, LoginUserHandler, RefreshTokenHandler } from "@controllers/auth.controllers";
import validateResource from "@middlewares/validateResource";
import { createUserSchema, verifyTokenSchema } from "@schema/user.schema";
import { loginUserSchema } from "@schema/user.schema";
const router:any = Router();


router.post("/signup", validateResource(createUserSchema), createUserHandler);


router.put("/signin", validateResource(loginUserSchema), LoginUserHandler);


router.put(
  "/refresh-token",
  validateResource(verifyTokenSchema),
  RefreshTokenHandler
);


export default router;
