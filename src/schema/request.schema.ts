import { object, string, TypeOf } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     createRequestInput:
 *       type: object
 *       required:
 *         - receiverId
 *       properties:
 *         receiverId:
 *           type: string
 */
const createRequestSchema = object({
  body: object({
    receiverId: string({
      required_error: "Receiver Id is required",
    }),
  }),
});
const acceptRequestRequestSchema = object({
  body: object({
    requestId: string({
      required_error: "Request Id is required",
    }),

  }),
});

export { createRequestSchema, acceptRequestRequestSchema };