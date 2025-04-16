import { updateHistory } from "#/controllers/history";
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

export default router;
