import {
  createPlaylist,
  deletePlaylist,
  getAudios,
  getPlaylistsByProfile,
  updatePlaylist,
} from "#/controllers/playlist";
import { isAuth, isVerified } from "#/middleware/auth";
import { validate } from "#/middleware/validator";
import {
  NewPlaylistValidationSchema,
  OldPlaylistValidationSchema,
} from "#/utils/validationSchema";
import { RequestHandler, Router } from "express";

const router = Router();

validate(NewPlaylistValidationSchema).then((validationMiddleware) => {
  router.post(
    "/create",
    isAuth as RequestHandler,
    isVerified as RequestHandler,
    validationMiddleware,
    createPlaylist as RequestHandler
  );
});

validate(OldPlaylistValidationSchema).then((validationMiddleware) => {
  router.patch(
    "/",
    isAuth as RequestHandler,
    isVerified as RequestHandler,
    validationMiddleware,
    updatePlaylist as RequestHandler
  );
});

router.delete(
  "/",
  isAuth as RequestHandler,
  isVerified as RequestHandler,
  deletePlaylist as RequestHandler
);

router.get(
  "/by-profile",
  isAuth as RequestHandler,
  isVerified as RequestHandler,
  getPlaylistsByProfile as RequestHandler
);

router.get(
  "/:playlistId",
  isAuth as RequestHandler,
  getAudios as RequestHandler
);

export default router;
