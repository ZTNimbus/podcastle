import { PaginationQuery } from "#/@types/misc";
import Audio, { AudioDocument } from "#/models/audio";
import Playlist from "#/models/playlist";
import User from "#/models/users";
import { Request, Response } from "express";
import { isValidObjectId, ObjectId } from "mongoose";

export async function updateFollower(req: Request, res: Response) {
  const { profileId } = req.params;

  let status: "added" | "removed";

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id" });

  const profile = await User.findById(profileId);

  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const alreadyFollowing = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });

  if (alreadyFollowing) {
    await User.updateOne(
      { _id: profileId },
      { $pull: { followers: req.user.id } }
    );

    status = "removed";
  } else {
    await User.updateOne(
      { _id: profileId },
      { $addToSet: { followers: req.user.id } }
    );

    status = "added";
  }

  if (status === "added") {
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { followings: profileId } }
    );
  }

  if (status === "removed") {
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { followings: profileId } }
    );
  }

  res.status(200).json({ status });
}

export async function getUploadedAudios(req: Request, res: Response) {
  const { limit = "20", page = "0" } = req.query as PaginationQuery;

  const data = await Audio.find({ owner: req.user.id })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const audios = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      file: item.file.url,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: { name: req.user.name, id: req.user.id },
    };
  });

  res.status(200).json({ audios });
}

export async function getPublicUploads(req: Request, res: Response) {
  const { profileId } = req.params;
  const { limit = "20", page = "0" } = req.query as PaginationQuery;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id" });

  const data = await Audio.find({
    owner: profileId,
  })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .populate<AudioDocument<{ name: string; _id: ObjectId }>>("owner");

  console.log(data);

  const audios = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      file: item.file.url,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: { name: item.owner.name, id: profileId },
    };
  });

  res.status(200).json({ audios });
}

export async function getPublicProfile(req: Request, res: Response) {
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id" });

  const user = await User.findById(profileId);
  if (!user) return res.status(404).json({ error: "Profile not found" });

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
      createdAt: user.createdAt,
    },
  });
}

export async function getPublicPlaylists(req: Request, res: Response) {
  const { profileId } = req.params;
  const { limit = "20", page = "0" } = req.query as PaginationQuery;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: "Invalid profile id" });

  const playlist = await Playlist.find({
    owner: profileId,
    visibility: "public",
  })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort("-createdAt");

  if (!playlist) return res.status(404).json({ playlist: [] });

  res.status(200).json({
    playlist: playlist.map((item) => {
      return {
        id: item._id,
        title: item.title,
        itemsCount: item.items.length,
        visibility: item.visibility,
      };
    }),
  });
}
