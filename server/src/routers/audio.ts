import { createAudio, updateAudio } from "#/controllers/audio";
import { isAuth, isVerified } from "#/middleware/auth";
import fileParser from "#/middleware/fileParser";
import { validate } from "#/middleware/validator";
import { AudioValidationSchema } from "#/utils/validationSchema";
import express, { Application, RequestHandler } from "express";

const router = express.Router();

validate(AudioValidationSchema).then((validationMiddleware) => {
  router.post(
    "/create",
    isAuth as RequestHandler,
    isVerified as RequestHandler,
    fileParser as RequestHandler,
    validationMiddleware,
    createAudio as RequestHandler
  );
});

validate(AudioValidationSchema).then((validationMiddleware) => {
  router.patch(
    "/:audioId",
    isAuth as RequestHandler,
    isVerified as RequestHandler,
    fileParser as RequestHandler,
    validationMiddleware,
    updateAudio as RequestHandler
  );
});

export default router;
