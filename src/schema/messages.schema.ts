import { number, object, string, TypeOf } from "zod";

const getMessagesSchema = object({
  query: object({
    chatId: string({
      required_error: "Chat Id is required",
    }),
    page: string({
      required_error: "Page is required",
    }),
    limit: string({
      required_error: "Limit is required",
    }),
  }),
});
export { getMessagesSchema };
