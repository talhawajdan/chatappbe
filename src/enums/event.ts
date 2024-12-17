export enum socketEvent {
  NewMessage = "NewMessage",
  NewMessageAlert = "NewMessageAlert",
  NewRequest = "NewRequest",
  NewGroup = "NewGroup",
  NewGroupMessage = "NewGroupMessage",
  DeleteGroup = "DeleteGroup",
  DeleteGroupMessage = "DeleteGroupMessage",
  sendToastNewMessage = "sendToastNewMessage",
  onlineUsers = "onlineUsers",
  typing = "typing",
  stopTyping = "stopTyping",
  refetchRequest = "refetchRequest",
}

export enum ToastMessageType {
  success = "success",
  error = "error",
  customFriendRequest = "customFriendRequest",
}
