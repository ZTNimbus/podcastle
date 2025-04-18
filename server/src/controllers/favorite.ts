import { PaginationQuery } from "#/@types/misc";
import Audio from "#/models/audio";
import Favorite from "#/models/favorite";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

export async function toggleFavorite(req: Request, res: Response) {
  const audioId = req.query.audioId as string;

  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Invalid audio id" });

  const audio = await Audio.findById(audioId);
  if (!audio) return res.status(404).json({ error: "Audio not found" });

  //Check if this like already exists
  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  let status: "added" | "removed";

  //Remove if so
  if (alreadyExists) {
    await Favorite.updateOne(
      { owner: req.user.id },
      {
        $pull: { items: audioId },
      }
    );

    status = "removed";
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });
    //add to existing favorites list
    if (favorite)
      await Favorite.updateOne(
        { owner: req.user.id },
        { $addToSet: { items: audioId } }
      );
    //If favorites list does not exist, create it and add the audioId to liked audios
    else await Favorite.create({ owner: req.user.id, items: [audioId] });

    status = "added";
  }

  if (status === "added") {
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id },
    });
  }

  if (status === "removed") {
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id },
    });
  }
  res.status(200).json({ status });
}

export async function getFavorites(req: Request, res: Response) {
  const userId = req.user.id;
  const { page = "0", limit = "20" } = req.query as PaginationQuery;

  const favorites = await Favorite.aggregate([
    { $match: { owner: userId } },

    {
      $project: {
        audioIds: {
          $slice: ["$items", parseInt(page) * parseInt(limit), parseInt(limit)],
        },
      },
    },

    { $unwind: "$audioIds" },

    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
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
        as: "ownerInfo",
      },
    },

    { $unwind: "$ownerInfo" },

    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        category: "$audioInfo.category",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        owner: {
          name: "$ownerInfo.name",
          id: "$ownerInfo._id",
        },
      },
    },
  ]);

  res.status(200).json({ audios: favorites });
}

export async function getIsFavorite(req: Request, res: Response) {
  const audioId = req.query.audioId as string;

  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Invalid audio id" });

  const favorite = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.status(200).json({ isFav: !!favorite });
}
