import { object, string, TypeOf } from "zod";

const removeContactFromFriends = object({
  query: object({
    contactId: string({
      required_error: "Contact Id is required",
    }),
  }),
});

export { removeContactFromFriends };