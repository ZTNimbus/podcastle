import {
  generateForgotPasswordLink,
  grandValid,
  logout,
  resetPassword,
  sendProfile,
  sendVerificationToken,
  signIn,
  signup,
  updateProfile,
  verifyEmail,
} from "#/controllers/auth";
import { isAuth, isValidPasswordResetToken } from "#/middleware/auth";
import fileParser from "#/middleware/fileParser";
import { validate } from "#/middleware/validator";
import {
  CreateUserSchema,
  ResetPasswordSchema,
  SignInValidationSchema,
  TokenAndIdVerification,
} from "#/utils/validationSchema";
import express, { Application, RequestHandler } from "express";

const router = express.Router();

validate(CreateUserSchema).then((validationMiddleware) => {
  router.post("/signup", validationMiddleware, signup as RequestHandler);
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

validate(SignInValidationSchema).then((validationMiddleware) => {
  router.post("/sign-in", validationMiddleware, signIn as RequestHandler);
});

router.get("/is-auth", isAuth as RequestHandler, sendProfile);

router.patch(
  "/update-profile",
  isAuth as RequestHandler,
  fileParser as Application,
  updateProfile
);

router.post("/logout", isAuth as RequestHandler, logout as RequestHandler);

export default router;
