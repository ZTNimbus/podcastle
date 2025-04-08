import { signup, verifyEmail } from "#/controllers/user";
import { validate } from "#/middleware/validator";
import { CreateUserSchema } from "#/utils/validationSchema";
import express, { RequestHandler } from "express";

const router = express.Router();

validate(CreateUserSchema).then((validationMiddleware) => {
  router.post("/signup", validationMiddleware, signup);
});

router.post("/verify-email", verifyEmail as RequestHandler);

export default router;
