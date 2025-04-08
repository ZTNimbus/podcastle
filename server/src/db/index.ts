import mongoose from "mongoose";
import { MONGODB_URI } from "#/utils/variables";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));
