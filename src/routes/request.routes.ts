import { Router } from "express";
import validateResource from "@middlewares/validateResource";
import {
  acceptRequestRequestSchema,
  createRequestSchema,
} from "@schema/request.schema";
import {
  AcceptRequestHandler,
  CreateRequestHandler,
} from "@controllers/request.controllers";
import isAuthenticated from "@middlewares/auth";
const router: any = Router();

router.post(
  "/create",
  validateResource(createRequestSchema),
  isAuthenticated,
  CreateRequestHandler
);

router.post(
  "/accept",
  validateResource(acceptRequestRequestSchema),
  isAuthenticated,
  AcceptRequestHandler
);

router.post("/reject", isAuthenticated, CreateRequestHandler);

router.post("/reject", isAuthenticated, CreateRequestHandler);
export default router;
