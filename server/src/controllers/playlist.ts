import { CreatePlaylistRequest, UpdatePlaylistRequest } from "#/@types/audio";
import Audio from "#/models/audio";
import Playlist from "#/models/playlist";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { PopulatedFavoriteList } from "./../@types/audio";

export async function createPlaylist(
  req: CreatePlaylistRequest,
  res: Response
) {
  const { title, resId, visibility } = req.body;
  const ownerId = req.user.id;

  if (resId) {
    const audio = await Audio.findById(resId);
    if (!audio) return res.status(404).json({ error: "Audio not found" });
  }

  const newPlaylist = new Playlist({
    title,
    owner: ownerId,
    visibility,
  });

  if (resId) newPlaylist.items = [resId as any]; //We already do check that this is a valid ObjectId in validation schema

  await newPlaylist.save();

  res
    .status(201)
    .json({ playlist: { id: newPlaylist._id, title, visibility } });
}

export async function updatePlaylist(
  req: UpdatePlaylistRequest,
  res: Response
) {
  const { title, id, item, visibility } = req.body;
  const ownerId = req.user.id;

  const playlist = await Playlist.findOneAndUpdate(
    {
      owner: ownerId,
      _id: id,
    },
    {
      title,
      visibility,
    },
    { new: true }
  );

  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  if (item) {
    const audio = await Audio.findById(item);
    if (!audio) return res.status(404).json({ error: "Audio not found" });

    await Playlist.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: item },
    });
  }

  res.status(201).json({ playlist: { id: playlist._id, title, visibility } });
}

export async function deletePlaylist(req: Request, res: Response) {
  const { playlistId, resId, all } = req.query;

  if (!isValidObjectId(playlistId))
    return res.status(422).json({ error: "Invalid playlist id" });

  if (all === "yes") {
    const playlist = await Playlist.findOneAndDelete({
      owner: req.user.id,
      _id: playlistId,
    });

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  }

  if (resId) {
    if (!isValidObjectId(resId))
      return res.status(422).json({ error: "Invalid audio id" });

    const playlist = await Playlist.findOneAndUpdate(
      { owner: req.user.id, _id: playlistId },
      { $pull: { items: resId } }
    );

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  }

  res.status(201).json({ success: true });
}

export async function getPlaylistsByProfile(req: Request, res: Response) {
  const { page = "0", limit = "20" } = req.query as {
    page: string;
    limit: string;
  };

  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .skip(parseInt(page) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const playlists = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });

  res.status(200).json({ playlists });
}

export async function getAudios(req: Request, res: Response) {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId))
    return res.status(422).json({ error: "Invalid playlist id" });

  const playlist = await Playlist.findOne({
    owner: req.user.id,
    _id: playlistId,
  }).populate<{ items: PopulatedFavoriteList[] }>({
    path: "items",
    populate: { path: "owner", select: "name" },
  });

  if (!playlist) return res.status(200).json({ playlist: [] });

  const audios = playlist.items.map((item) => ({
    id: item._id,
    title: item.title,
    category: item.category,
    file: item.file.url,
    poster: item.poster?.url,
    owner: { name: item.owner.name, id: item.owner._id },
  }));

  res.status(200).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      audios,
    },
  });
}
