import logger from "@utils/logger"

 function validateJsonFunction (err: any, _req: any, res: any, next: any) {
  if (err instanceof SyntaxError && "body" in err) {
    logger.error("Invalid JSON received");
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next();
};

export default validateJsonFunction