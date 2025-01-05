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
});
const CreateGroupChat = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    members: array(
      string({
        required_error: "Members are required",
      })
    ).min(2, "At least 2 member is required"),
  }),
});
const UpdateGroupChatName = object({
  body: object({
    chatId: string({
      required_error: "Chat Id is required",
    }),
    NewGroupName: string({
      required_error: "NewGroupName is required",
    }),
  }),
});
const UpdateGroupChatCreator = object({
  body: object({
    chatId: string({
      required_error: "chatId is required",
    }),
    newCreatorId: string({
      required_error: "newCreatorId is required",
    }),
  }),
});
const updateGroupChatMembers = object({
  body: object({
    chatId: string({
      required_error: "chatId is required",
    }),
    newMembers: array(
      string({
        required_error: "Members are required",
      })
    ).min(2, "At least 2 member is required"),
  }),
});

export {
  createChat,
  deleteChat,
  getASingleChat,
  CreateGroupChat,
  UpdateGroupChatName,
  UpdateGroupChatCreator,
  updateGroupChatMembers,
};
