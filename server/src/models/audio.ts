import { Model, model, models, ObjectId, Schema } from "mongoose";
import { categories, CategoryTypes } from "./../utils/audioCategories";

export interface AudioDocument<T = ObjectId> {
  _id: ObjectId;
  title: string;
  about: string;
  owner: T;

  file: {
    url: string;
    publicId: string;
  };

  poster?: {
    url: string;
    publicId: string;
  };

  likes: ObjectId[];

  category: CategoryTypes;
}

const AudioSchema = new Schema<AudioDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: Object,
      url: String,
      publicId: String,
      required: true,
    },
    poster: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: categories,
      default: "Others",
    },
  },
  {
    timestamps: true,
  }
);

const Audio =
  models.Audio || (model("Audio", AudioSchema) as Model<AudioDocument>);

export default Audio as Model<AudioDocument>;
