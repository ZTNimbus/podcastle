import { toggleFavorite } from "#/controllers/favorite";
import { isAuth, isVerified } from "#/middleware/auth";
import express, { RequestHandler } from "express";

const router = express.Router();

router.post(
  "/",
  isAuth as RequestHandler,
  isVerified as RequestHandler,
  toggleFavorite
);

export default router;
