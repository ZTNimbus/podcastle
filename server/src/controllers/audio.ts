import { PopulatedFavoriteList } from "#/@types/audio";
import cloudinary from "#/cloud";
import { RequestWithFiles } from "#/middleware/fileParser";
import Audio from "#/models/audio";
import { Request, Response } from "express";
import formidable from "formidable";

interface CreateAudioRequest extends RequestWithFiles {
  body: { title: string; category: string; about: string };
}

export async function createAudio(req: CreateAudioRequest, res: Response) {
  const { title, category, about } = req.body;

  const poster = req.files?.poster as formidable.File;
  const audioFile = req.files?.file as formidable.File;
  const ownerId = req.user.id;

  if (!audioFile)
    return res.status(422).json({ error: "Audio file is required" });

  const audioResponse = await cloudinary.uploader.upload(audioFile.filepath, {
    resource_type: "video",
  });

  const newAudio = new Audio({
    title,
    about,
    owner: ownerId,
    category,
    file: {
      url: audioResponse.secure_url,
      publicId: audioResponse.public_id,
    },
  });

  if (poster) {
    const posterResponse = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    });

    newAudio.poster = {
      url: posterResponse.secure_url,
      publicId: posterResponse.public_id,
    };
  }

  await newAudio.save();

  res.status(201).json({
    audio: {
      title,
      about,
      file: newAudio.file.url,
      poster: newAudio.poster?.url,
    },
  });
}

export async function updateAudio(req: CreateAudioRequest, res: Response) {
  const { title, category, about } = req.body;
  const poster = req.files?.poster as formidable.File;
  const ownerId = req.user.id;
  const { audioId } = req.params;

  const audio = await Audio.findOneAndUpdate(
    { owner: ownerId, _id: audioId },
    {
      title,
      category,
      about,
    },
    { new: true }
  );

  if (!audio) return res.status(404).json({ error: "Audio not found" });

  if (poster) {
    if (audio.poster?.publicId)
      await cloudinary.uploader.destroy(audio.poster.publicId);

    const posterResponse = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    });

    audio.poster = {
      url: posterResponse.secure_url,
      publicId: posterResponse.public_id,
    };

    await audio.save();
  }

  res.status(200).json({
    audio: {
      title,
      about,
      file: audio.file.url,
      poster: audio.poster?.url,
    },
  });
}

export async function getLatestUploads(req: Request, res: Response) {
  const latest = await Audio.find()
    .sort("-createdAt")
    .limit(10)
    .populate<PopulatedFavoriteList>("owner");

  const audios = latest.map((item) => {
    return {
      id: item._id,
      title: item.title,
      file: item.file.url,
      owner: { name: item.owner.name, id: item.owner._id },
      poster: item.poster?.url,
      category: item.category,
      about: item.about,
      date: item.createdAt,
    };
  });

  res.status(200).json({ audios });
}
