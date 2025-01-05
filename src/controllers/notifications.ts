import { HttpStatusCode } from "@enums/statusCode";
import { FindRequestBySender } from "@services/request.service";
import {
  sendSuccessResponse,
  tryCatchWrapper
} from "@utils/helper";
import { Request, Response } from "express";

interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const GetNotificationsHandler = tryCatchWrapper(
  async (req: CustomRequest, res: Response) => {
    const { page = 1, limit = 10 }: any = req.query;
    const userId = req.userId;
    const skip = (page - 1) * limit;
    const { request, totalPages, total } = await FindRequestBySender(
      skip,
      limit,
      userId
    );
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "Notifications fetched successfully",
      {
        request,
        meta: {
          page,
          limit,
          totalPages,
          total
        },
      }
    );
  }
);
export { GetNotificationsHandler };
