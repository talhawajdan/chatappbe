import { Request, Response } from "express";
import authRoutes from "@routes/auth.routes";
import userRoutes from "@routes/user.routes";
import requestRoutes from "@routes/request.routes";
import notifications from "@routes/notification.routes";
import SettingRoutes from "@routes/setting.routes";
import contactsRouter from "@routes/contact.routes";
import chatsRouter from "@routes/chats.routes";
import messagesRouter from "@routes/message.routes";
import { HttpStatusCode } from "@enums/statusCode";


function route(app: any) {
  app.use("/auth", authRoutes);
  app.use("/request", requestRoutes);
  app.use("/settings", SettingRoutes);
  app.use("/notification", notifications);
  app.use("/contacts", contactsRouter);
  app.use("/chats", chatsRouter);
  app.use("/message", messagesRouter);
  app.use("/user", userRoutes);
  
  
  app.get("/healthCheck", (_req: Request, res: Response) => {
    res.sendStatus(HttpStatusCode.OK);
  });

  app.get("/", (_req: Request, res: Response) => {
    res.redirect("/api-docs");
  });
}

export default route;
