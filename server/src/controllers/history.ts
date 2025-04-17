import { PaginationQuery } from "#/@types/misc";
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

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },

    {
      $unwind: "$all",
    },

    { $match: { "all.date": { $gte: startOfDay, $lt: endOfDay } } },

    { $project: { _id: 0, audio: "$all.audio" } },
  ]);

  const sameDayHistory = histories.find(
    (item) => item.audio.toString() === audio
  );

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      { owner: req.user.id, "all.audio": audio },
      { $set: { "all.$.progress": progress, "all.$.date": date } }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory?._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }

  res.status(201).json({ success: true });
}

export async function deleteHistory(req: Request, res: Response) {
  const removeAll = req.query.all === "yes";

  if (removeAll) {
    await History.findOneAndDelete({ owner: req.user.id });

    res.status(200).json({ success: true });
  }

  const histories = req.query.histories as string; //Is actually an array
  const ids = JSON.parse(histories) as string[];

  await History.findOneAndUpdate(
    {
      owner: req.user.id,
    },
    { $pull: { all: { _id: ids } } }
  );

  res.status(200).json({ success: true });
}

export async function getHistories(req: Request, res: Response) {
  const { page = "0", limit = "20" } = req.query as PaginationQuery;

  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },

    {
      $project: {
        all: {
          $slice: ["$all", parseInt(page) * parseInt(limit), parseInt(limit)],
        },
      },
    },

    { $unwind: "$all" },

    {
      $lookup: {
        from: "audios",
        localField: "all.audio",
        foreignField: "_id",
        as: "audioInfo",
      },
    },

    { $unwind: "$audioInfo" },

    {
      $project: {
        _id: 0,
        id: "$all._id",
        audioId: "$audioInfo._id",
        date: "$all.date",
        title: "$audioInfo.title",
      },
    },

    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        audios: { $push: "$$ROOT" },
      },
    },

    { $project: { _id: 0, id: "$id", date: "$_id", audios: "$$ROOT.audios" } },

    { $sort: { date: -1 } },
  ]);

  res.status(200).json({ histories });
}

export async function getRecentlyPlayed(req: Request, res: Response) {
  const audios = await History.aggregate([
    { $match: { owner: req.user.id } },

    { $project: { myHistory: { $slice: ["$all", 2] } } },

    {
      $project: {
        histories: {
          $sortArray: { input: "$myHistory", sortBy: { date: -1 } },
        },
      },
    },

    { $unwind: { path: "$histories", includeArrayIndex: "index" } },

    {
      $lookup: {
        from: "audios",
        localField: "histories.audio",
        foreignField: "_id",
        as: "audioInfo",
      },
    },

    { $unwind: "$audioInfo" },

    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    { $unwind: "$owner" },

    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        category: "$audioInfo.category",
        owner: { name: "$owner.name", id: "$owner._id" },
        date: "$histories.date",
        progress: "$histories.progress",
      },
    },
  ]);

  res.status(200).json({ audios });
}
