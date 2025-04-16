import {
  getPublicPlaylists,
  getPublicProfile,
  getPublicUploads,
  getUploadedAudios,
  updateFollower,
} from "#/controllers/profile";
import { isAuth } from "#/middleware/auth";
import { RequestHandler, Router } from "express";

const router = Router();

router.post(
  "/update-follower/:profileId",
  isAuth as RequestHandler,
  updateFollower as RequestHandler
);

router.get(
  "/uploads",
  isAuth as RequestHandler,
  getUploadedAudios as RequestHandler
);

//Public routes
router.get("/uploads/:profileId", getPublicUploads as RequestHandler);

router.get("/info/:profileId", getPublicProfile as RequestHandler);

router.get("/playlists/:profileId", getPublicPlaylists as RequestHandler);

export default router;
