import { Request } from "express";

export interface CreateUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export interface VerifyEmailRequest extends Request {
  body: {
    userId: string;
    token: string;
  };
}
