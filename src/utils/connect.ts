import mongoose from "mongoose";
import config from "config";
import logger from "@utils/logger";

const connectDB = async () => {
  const dbUri = config.get<string>("dbUrl");
  
  return mongoose.connect(dbUri).then(() => {
    logger.info("Connected to DB");
  }).catch((error) => {
    logger.error(error.message);
    process.exit(1);
  });
};

export default connectDB;
