import {
  generateForgotPasswordLink,
  grandValid,
  resetPassword,
  sendVerificationToken,
  signup,
  verifyEmail,
} from "#/controllers/user";
import { isValidPasswordResetToken } from "#/middleware/auth";
import { validate } from "#/middleware/validator";
import {
  CreateUserSchema,
  ResetPasswordSchema,
  TokenAndIdVerification,
} from "#/utils/validationSchema";
import express, { Application, RequestHandler } from "express";

const router = express.Router();

validate(CreateUserSchema).then((validationMiddleware) => {
  router.post("/signup", validationMiddleware, signup);
});

validate(TokenAndIdVerification).then((validationMiddleware) => {
  router.post(
    "/verify-email",
    validationMiddleware,
    verifyEmail as RequestHandler
  );
});

router.post("/re-verify-email", sendVerificationToken as Application);

router.post("/forgot-password", generateForgotPasswordLink as RequestHandler);

validate(TokenAndIdVerification).then((validationMiddleware) => {
  router.post(
    "/verify-password-reset-token",
    validationMiddleware,
    isValidPasswordResetToken as RequestHandler,
    grandValid
  );
});

validate(ResetPasswordSchema).then((validationMiddleware) => {
  router.post(
    "/reset-password",
    validationMiddleware,
    isValidPasswordResetToken as RequestHandler,
    resetPassword as RequestHandler
  );
});

export default router;
