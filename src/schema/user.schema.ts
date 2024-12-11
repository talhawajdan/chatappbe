import { object, string, TypeOf } from "zod";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required:
 *        - email
 *        - firstName
 *        - lastName
 *        - password
 *        - phone
 *        - passwordConfirmation
 *        - dob
 *      properties:
 *        email:
 *          type: string
 *          default: dannyalbus@yopmail.com
 *        firstName:
 *          type: string
 *          default: danny
 *        lastName:
 *          type: string
 *          default: albus
 *        password:
 *          type: string
 *          default: stringPassword123
 *        phone:
 *          type: string
 *          default: +442255789
 *        passwordConfirmation:
 *          type: string
 *          default: stringPassword123
 *        dob:
 *          type: string
 *          format: date
 *          default: 1997-01-29
 *
 *    CreateUserResponse:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *        name:
 *          type: string
 *        _id:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 */

 const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
    passwordConfirmation: string({
      required_error: "passwordConfirmation is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
    phone: string({
      required_error: "Phone is required",
    }),
    dob: string({
      required_error: "Date of birth (dob) is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});
/**
 * @openapi
 * components:
 *   schemas:
 *     loginUserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           default: dannyalbus@yopmail.com
 *         password:
 *           type: string
 *           default: stringPassword123
 *     loginUserResponse:
 *       type: object
 *       properties:
 *         authToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */

 const loginUserSchema = object({
   body: object({
     email: string({
       required_error: "Email is required",
     }).email("Not a valid email"),
     password: string({
       required_error: "Password is required",
     }),
   }),
 });
/**
 * @openapi
 * components:
 *   schemas:
 *     verifyTokenInput:
 *       type: object
 *       required:
 *         - refreshToken
 *         - userId
 *       properties:
 *         refreshToken:
 *           type: string
 *           default: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *         userId:
 *           type: string
 *           default: 6746c0ae5099a0f8c80de7eb
 *     UpdateUserProfile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         dob:
 *           type: string
 *           format: date
 *         phone:
 *           type: string
 *           description: User's phone number (10 digits)
 *       example:
 *         firstName: Jane
 *         lastName: Doe
 *         dob: "1992-05-15"
 *         phone: "0987654321"
 */

 const verifyTokenSchema = object({
   body: object({
     refreshToken: string({
       required_error: "Token is required",
     }),
     userId: string({
       required_error: "userId is required",
     }),
   }),
 });
export {
  loginUserSchema,
  verifyTokenSchema,
  createUserSchema
}
// Update User Profile Schema
export const updateUserSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    dob: string({
      required_error: "Date of birth (dob) is required",
    }),
    phone: string({
      required_error: "Phone is required",
    })
  }),
  query: object({
    userId: string({
      required_error: "User ID is required",
    }),
  }),
});
export const updateUserImgSchema = object({
  file: string()
    .refine((value) => value !== undefined, {
      message: "File must be provided",
    }),
});
/**
 * @openapi
 * components:
 *   schemas:
 *     userImageUpload:
 *       type: object
 *       required:
 *         - file
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: User's profile image
 */


export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  "body.passwordConfirmation"
>;
