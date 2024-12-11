import { HttpStatusCode } from "@enums/statusCode";
import {
  deleteUserAvatar,
  FindUserById,
  searchUsers,
  UpdateUser,
  uploadUserAvatar,
} from "@services/user.service";
import {
  deleteFilesFromCloudinary,
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
  uploadFilesToCloudinary
} from "@utils/helper";
import { Request, Response } from "express";
interface CustomRequest extends Request {
  userId: string; // Use `string` or the appropriate type for `user_id`
}

async function GetUserProfileDetailsHandler(req: CustomRequest, res: Response) {
  const { userId } = req;
  try {
    const user = await FindUserById(userId);
    if (!user) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        "user not found"
      );
    }
    const payload = { ...user, avatar: user.avatar?.url };
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "user profile details",
      payload
    );
  } catch (e: any) {
    return sendErrorResponse(res, HttpStatusCode.Unauthorized, e.message);
  }
}
const UpdateUserProfileHandler = tryCatchWrapper(
  async (req: CustomRequest, res: Response) => {
    const { userId }: any = req.query;
    const { firstName, lastName, dob, phone } = req.body;
    const input = { firstName, lastName, dob, phone };

    const user = await UpdateUser(userId, input);

    if (!user) {
      return sendErrorResponse(
        res,
        HttpStatusCode.BadRequest,
        "user not found"
      );
    }
    const payload = user;
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "user updated successfully",
      payload
    );
  }
);
// update the user profile img
const UserProfileImgHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const userId = req.userId;
  const file = req.file;

  if (!file) {
    return sendErrorResponse(res, HttpStatusCode.BadRequest, "no file found");
  }
  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };
  const user = await uploadUserAvatar(userId, avatar);
  return sendSuccessResponse(
    res,
    HttpStatusCode.OK,
    "User Image uploaded successfully",
    user
  );
});
const UserProfileDeleteImgHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const userId = req.userId;

  const { avatar } = await FindUserById(userId);

  if (!avatar) {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "no user avatar found"
    );
  }

  const result = await deleteFilesFromCloudinary([avatar.public_id]);
  console.log(result, "result");
  if (result[0]?.result === "ok") {
    const user = await deleteUserAvatar(userId);
    return sendSuccessResponse(
      res,
      HttpStatusCode.OK,
      "User Image deleted successfully",
      user
    );
  } else {
    return sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "error in deleting user avatar",
      {
        cloudanry_Error: result,
      }
    );
  }
});
const SearchUserHandler = tryCatchWrapper(async function (
  req: CustomRequest,
  res: Response
) {
  const { search = "" }: any = req.query;
  let { page = 1, limit = 10 }: any = req.query;
  const userId = req.userId;
  
  limit = Number(limit) 

  const skip = (page - 1) * limit;
  const { user, totalPages, total } = await searchUsers(
    search,
    skip,
    limit,
    userId
  );
  return sendSuccessResponse(res, HttpStatusCode.OK, "users found", {
    ...user,
    meta: {
      page,
      limit,
      totalPages,
      total,
    }
  });
});

export {
  GetUserProfileDetailsHandler, SearchUserHandler, UpdateUserProfileHandler, UserProfileDeleteImgHandler, UserProfileImgHandler
};
