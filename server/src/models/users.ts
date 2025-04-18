import { compare, hash } from "bcrypt";
import { Model, model, ObjectId, Schema } from "mongoose";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar: {
    url: string;
    publicId: string;
  };
  tokens: string[];
  favorites: ObjectId[];
  followers: ObjectId[];
  followings: ObjectId[];
  createdAt: Date;
}

interface Methods {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, Methods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Object,
      url: String,
      publicId: String,
    },

    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    tokens: [String],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password"))
    this.password = await hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

export default model("User", userSchema) as Model<UserDocument, {}, Methods>;
