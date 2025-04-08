import { NextFunction, Request, RequestHandler, Response } from "express";
import * as yup from "yup";

export async function validate(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(422).json({ error: "No request body" });
      return;
    }

    const schemaToValidate = yup.object({
      body: schema,
    });

    try {
      await schemaToValidate.validate(
        {
          body: req.body,
        },
        { abortEarly: true }
      );

      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(422).json({ error: error.message });
      }
    }
  };
}
