import { compare, hash } from "bcrypt";
import { Model, model, ObjectId, Schema } from "mongoose";

interface PasswordResetTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const passwordResetTokenSchema = new Schema<
  PasswordResetTokenDocument,
  {},
  Methods
>({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: "1h",
    required: true,
    default: Date.now(),
  },
});

passwordResetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) this.token = await hash(this.token, 10);
  next();
});

passwordResetTokenSchema.methods.compareToken = async function (token) {
  return await compare(token, this.token);
};

export default model("PasswordResetToken", passwordResetTokenSchema) as Model<
  PasswordResetTokenDocument,
  {},
  Methods
>;
