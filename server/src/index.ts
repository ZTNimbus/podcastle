import "dotenv/config";
import express from "express";
import "./db";
import authRouter from "./routers/auth";
import audioRouter from "./routers/audio";
import favoriteRouter from "./routers/favorite";
import playlistRouter from "./routers/playlist";
import profileRouter from "./routers/profile";
import historyRouter from "./routers/history";
import { PORT } from "./utils/variables";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/api/auth", authRouter);
app.use("/api/audio", audioRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api/profile", profileRouter);
app.use("/api/history", historyRouter);

app.listen(PORT, () => console.log("Server listening on port", PORT));
