import {
  getFavorites,
  getIsFavorite,
  toggleFavorite,
} from "#/controllers/favorite";
import { isAuth, isVerified } from "#/middleware/auth";
import express, { RequestHandler } from "express";

const router = express.Router();

router.post(
  "/",
  isAuth as RequestHandler,
  isVerified as RequestHandler,
  toggleFavorite as RequestHandler
);

router.get("/", isAuth as RequestHandler, getFavorites as RequestHandler);

router.get(
  "/is-favorite",
  isAuth as RequestHandler,
  getIsFavorite as RequestHandler
);

export default router;
