import { NextFunction, Request, Response } from "express";
import formidable, { File } from "formidable";

export interface RequestWithFiles extends Request {
  files?: { [key: string]: File };
}

const fileParser = async (
  req: RequestWithFiles,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data;"))
    return res.status(422).json({ error: "Only accepts form-data!" });

  const form = formidable({ multiples: false });

  const [fields, files] = await form.parse(req);

  for (let key in fields) {
    const field = fields[key];

    if (!req.body) req.body = {};

    if (field) {
      req.body[key] = field[0];
    }
  }

  for (let key in files) {
    const file = files[key];

    if (!req.files) {
      req.files = {};
    }

    if (file) {
      req.files[key] = file[0];
    }
  }

  next();
};

export default fileParser;
