import { socketEvent, ToastMessageType } from "@enums/event";
import { requestStatus } from "@enums/requestStatus";
import { HttpStatusCode } from "@enums/statusCode";
import {
  createRequest,
  deleteRequest,
  FindRequestById,
  FindRequestExistsCreate
} from "@services/request.service";
import { updateUserFriends } from "@services/user.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
} from "@utils/helper";
import { emitEvent } from "@utils/socket";
import { Request, Response } from "express";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

const CreateRequestHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const userId = req.userId;
  const { receiverId } = req.body;
  const requestExists = await FindRequestExistsCreate(userId, receiverId);
  if (requestExists) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Request already exists"
    );
  }
  const input = {
    sender: userId,
    receiver: receiverId,
    status: requestStatus.pending,
  };
  const request = await createRequest(input);
  emitEvent(req, socketEvent.NewRequest, [receiverId]);
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Request sent successfully",
    request
  );
});
const AcceptRequestHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { requestId } = req.body;
  const requestExists: any = await FindRequestById(requestId);
  if (!requestExists) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "Request not found"
    );
  }

  await updateUserFriends(
    requestExists.receiver?._id,
    requestExists.sender?._id
  );
  await updateUserFriends(
    requestExists.sender?._id,
    requestExists.receiver?._id
  );

  await deleteRequest(requestId);
  emitEvent(
    req,
    socketEvent.sendToastNewMessage,
    [requestExists.receiver?._id],
    {
      message: `${requestExists.sender?.firstName} ${requestExists.sender?.lastName} is your friend now `,
      type: ToastMessageType.success,
    }
  );
  emitEvent(req, socketEvent.sendToastNewMessage, [requestExists.sender?._id], {
    message: `${requestExists.receiver?.firstName} ${requestExists.receiver?.lastName} accepted your request `,
    type: ToastMessageType.success,
  });
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "Request accepted successfully"
  );
});

export { AcceptRequestHandler, CreateRequestHandler };

