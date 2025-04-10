import { Model, model, models, ObjectId, Schema } from "mongoose";

interface FavoriteDocument {
  owner: ObjectId;
  items: ObjectId[];
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Audio",
      },
    ],
  },
  { timestamps: true }
);

const Favorite = models.Favorite || model("Favorite", favoriteSchema);

export default Favorite as Model<FavoriteDocument>;
