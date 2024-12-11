import { validateJsonFunction } from "@middlewares/validateJsonFormat";
import route from "@root/src/routes/routes";
import connectDB from "@utils/connect";
import logger from "@utils/logger";
import ioServer from "@utils/socket";
import swagger from "@utils/swagger";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import config from "config";
import cors from "cors";
import express, { Express } from "express";
import { createServer } from "http";
const app = express();
const server = createServer(app);
ioServer(server, app);


const port = config.get<number>("port");
const CNAME= config.get<string>("cloudinary_cloud_name");
const CKEY= config.get<string>("cloudinary_api_key");
const CSECRET= config.get<string>("cloudinary_api_secret");
app.use(bodyParser.json());

cloudinary.config({
  cloud_name: CNAME,
  api_key: CKEY,
  api_secret: CSECRET,
});

// middleware to parse urlencoded request body
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to handle JSON parsing errors
app.use(validateJsonFunction);
app.use(cors());
server.listen(port, async () => {
  await connectDB();
  logger.info(`Server is running on port ${port}`);
  route(app as Express);
  swagger(app);
});

export default app;