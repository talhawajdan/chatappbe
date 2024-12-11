import { array, boolean, object, string, TypeOf } from "zod";

const createChat = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    groupChat: boolean().optional(),
    members: array(
      string({
        required_error: "Members are required",
      })
    ).min(1, "At least one member is required"),
  }),
});
const deleteChat = object({
  body: object({
    chatId: string({
      required_error: "Chat Id is required",
    }),
  }),
});
const getASingleChat = object({
  query: object({
    chatId: string({
      required_error: "Chat Id is required",
    }),
  }),
})
export { createChat, deleteChat, getASingleChat };
