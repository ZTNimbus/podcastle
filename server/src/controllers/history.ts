import History, { HistoryType } from "#/models/history";
import { Request, Response } from "express";

export async function updateHistory(req: Request, res: Response) {
  const { audio, progress, date } = req.body;
  const oldHistory = await History.findOne({ owner: req.user.id });

  const history: HistoryType = { audio, progress, date };

  if (!oldHistory) {
    await History.create({
      owner: req.user.id,
      last: history,
      all: [history],
    });

    res.status(201).json({ success: true });
  }
}
