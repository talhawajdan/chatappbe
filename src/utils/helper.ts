import { ApiMessage } from "@enums/statusCode";
import { v2 as cloudinary } from "cloudinary";
import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import logger from "../utils/logger";

function generateTokens(payload: any) {
  const authToken = jwt.sign(payload, config.get<string>("jwt_secret"), {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, config.get<string>("jwt_secret"), {
    expiresIn: "1d",
  });

  return { authToken, refreshToken };
}
function varifyToken(token: string) {
  return jwt.verify(token, config.get<string>("jwt_secret"));
}

// Helper to send error response
function sendErrorResponse(
  res: Response,
  statusCode: number,
  errorMessage: string,
  payload?: any,
  ...rest: any
): Response {
  return res.status(statusCode).json({
    message: ApiMessage.generalError,
    errorMessage: { message: errorMessage ?? "error" },
    data: payload,
    ...(rest.length > 0 && { ...rest }),
  });
}
function sendSuccessResponse(
  res: Response,
  statusCode: number,
  successMessage?: string | undefined | Array<any>,
  payload?: any,
  ...rest: any
): Response {
  return res.status(statusCode).json({
    message: ApiMessage.generalSuccess,
    successMessage: successMessage ?? "success",
    data: payload,
    ...(rest.length > 0 && { ...rest }),
  });
}
const tryCatchWrapper = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      logger.error(error.message);

      // Customize the error response here
      return res.status(error?.status || 500).json({
        success: false,
        message: error.message || "An unexpected error occurred.",
        error: error.details || null,
      });
    }
  };
};
export const getBase64 = (file: any) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
const uploadFilesToCloudinary = async (files: any) => {
  const uploadPromises = files.map((file: any) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result: any) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err: any) {
    throw new Error(`Error uploading files to cloudinary: ${err.message}`);
  }
};

const deleteFilesFromCloudinary = async (public_ids: any) => {
  const uploadPromises = public_ids.map((public_id: any) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  });
  try {
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (err: any) {
    throw new Error(`Error deleting files to cloudinary: ${err.message}`);
  }
};

export {
  deleteFilesFromCloudinary,
  generateTokens,
  sendErrorResponse,
  sendSuccessResponse,
  tryCatchWrapper,
  uploadFilesToCloudinary,
  varifyToken,
};
