import { Request, Response } from "express";
import { ApiMessage, HttpStatusCode } from "@enums/statusCode";
import {
  createUser,
  FindUserByEmail,
  FindUserById,
} from "@services/user.service";
import {
  generateTokens,
  sendErrorResponse,
  sendSuccessResponse,
  varifyToken,
  tryCatchWrapper,
} from "@utils/helper";
import bcrypt from "bcrypt";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";

const createUserHandler = tryCatchWrapper(
  async (req: Request<{}, {}, CreateUserInput["body"]>, res: Response) => {
    const user = await createUser(req.body);
    const tokens = generateTokens({ _id: user._id, email: user.email });

    const payload = {
      ...tokens,
      user: omit(user, "password"),
    };

    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      ["user created successfully", "you are successFully logged in"],
      payload
    );
  }
);

const LoginUserHandler = tryCatchWrapper(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await FindUserByEmail(email);
    if (!user) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        ApiMessage.badCredentials
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        ApiMessage.badCredentials
      );
    }

    // Generate tokens
    const tokens = generateTokens({ _id: user._id, email: user.email });
    const payload = {
      ...tokens,
      user: omit(user, "password"),
    };

    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      `Welcome Back ${user.firstName} ${user.lastName}`,
      payload
    );
  }
);

const RefreshTokenHandler = tryCatchWrapper(
  async (req: Request, res: Response) => {
    const { refreshToken, userId } = req.body;
    const user = await FindUserById(userId);
    if (!user) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        ApiMessage.badCredentials
      );
    }
    const verify = varifyToken(refreshToken);
    if (!verify) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        ApiMessage.badCredentials
      );
    }
    const tokens = generateTokens(user);

    return sendSuccessResponse(res, HttpStatusCode.OK, "", tokens);
  }
);

export { createUserHandler, LoginUserHandler, RefreshTokenHandler };
