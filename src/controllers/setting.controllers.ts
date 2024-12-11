import { Request, Response } from "express";

import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
} from "@utils/helper";
import { getUsersFriends, removeFriend } from "@services/user.service";
import { HttpStatusCode } from "@enums/statusCode";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const ListOfContactsSettingsHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { search = "" }: any = req.query;
  const userId = req.userId;
  let { page = 1, limit = 10 }: any = req.query;
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;
  const { friends, total, totalPages } = await getUsersFriends(
    userId,
    skip,
    limit,
    search
  );
  
  const payload = {
    ...friends,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "contacts found successfully",
    payload
  );
});

const removeContactHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const userId = req.userId;
  const { contactId }:any = req.query;
  const user= await removeFriend(userId, contactId);
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Contact removed successfully",
    user
  );
})

export { ListOfContactsSettingsHandler, removeContactHandler };
