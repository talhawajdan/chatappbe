import { HttpStatusCode } from "@enums/statusCode";
import { getUsersFriendsList } from "@services/user.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper
} from "@utils/helper";
import { Request, Response } from "express";

interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const GetUserContactsListHandler=tryCatchWrapper(
  async function(req: CustomRequest, res: Response) {
    const { userId } = req;
    try {
      const user = await getUsersFriendsList(userId);
      return sendSuccessResponse(res, HttpStatusCode.OK, "user Constacts found", user);
    } catch (e: any) {
      return sendErrorResponse(res, HttpStatusCode.Unauthorized, e.message);
    }
  }
)

export { GetUserContactsListHandler };
