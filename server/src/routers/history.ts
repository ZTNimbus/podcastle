import {
  deleteHistory,
  getHistories,
  getRecentlyPlayed,
  updateHistory,
} from "#/controllers/history";
import { isAuth } from "#/middleware/auth";
import { validate } from "#/middleware/validator";
import { UpdateHistorySchema } from "#/utils/validationSchema";
import { RequestHandler, Router } from "express";

const router = Router();

validate(UpdateHistorySchema).then((validationMiddleware) => {
  router.post(
    "/",
    isAuth as RequestHandler,
    validationMiddleware,
    updateHistory as RequestHandler
  );
});

router.delete("/", isAuth as RequestHandler, deleteHistory as RequestHandler);

router.get("/", isAuth as RequestHandler, getHistories as RequestHandler);

router.get(
  "/recent",
  isAuth as RequestHandler,
  getRecentlyPlayed as RequestHandler
);

export default router;
