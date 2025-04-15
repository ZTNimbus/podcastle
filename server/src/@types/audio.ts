import { AudioDocument } from "#/models/audio";
import { ObjectId } from "mongoose";

export type PopulatedFavoriteList = AudioDocument<{
  _id: ObjectId;
  name: string;
}>;
