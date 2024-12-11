import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      let errorMessage=e.errors.map((e: any) =>e.message).join(",");
      return res.status(400).send({
        data:{
          error:"Invalid",
          errorMessage: errorMessage
        }
      });
    }
  };

export default validate;
