import { HttpStatusCode } from "@enums/statusCode";
import { sendErrorResponse, varifyToken } from "@utils/helper";
import { Request, Response, NextFunction } from "express";
interface AuthenticatedRequest extends Request {
  userId: string;
}

const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(
        res,
        HttpStatusCode.Unauthorized,
        "Please login To access this Route."
      );
    }
    const decodedToken: any = varifyToken(token);
    if (!decodedToken) {
      return sendErrorResponse(
        res,
        HttpStatusCode.Unauthorized,
        "Please login To access this Route."
      );
    }
    req.userId = decodedToken._id;
    next();
  } catch (e: any) {
   console.error(e,"Error")
    return sendErrorResponse(res, HttpStatusCode.Unauthorized, e.message);
  }
};

export default isAuthenticated;
