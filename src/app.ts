import express, { NextFunction, Request, Response } from "express";
import * as log from "./utils/logger.js";
import "dotenv/config";
import { checkAuth, checkAdminAuth, authRouter } from "./managers/auth.js";
import { userRouter } from "./managers/user.js";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import fs from "fs";

export const prisma = new PrismaClient()

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import config from "../config.json" assert { type: "json" };

const app = express();
app.use("/assets", express.static(path.join(__dirname + "/render/assets")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/render"));

app.use(authRouter);
app.use(userRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    log.error(err.stack, "Error Handler");
    res.status(500).send('An error occured while trying to handle your request.');
});

app.get("/", checkAuth, (req, res) => {
    res.render("dashboard", { "panel_title": config.panel_title, "token": "", other: {} });
});

app.get("/tab/:tab", checkAuth, (req, res) => {
    const { tab } = req.params;
    if (tab && fs.existsSync(path.join(__dirname, `/render/tabs/${tab}.ejs`))) {
        res.render(`tabs/${tab.toString()}`);
    } else {
        res.render("dashboard", { "panel_title": config.panel_title, "token": "", other: {} });
    }
});

app.get("/admin", checkAdminAuth, (req, res) => {
    res.render("dashboard", { "panel_title": config.panel_title, "token": "", other: { admin: "true" } });
});

app.get("/tab/admin/:tab", checkAdminAuth, (req, res) => {
    const { tab } = req.params;
    if (tab && fs.existsSync(path.join(__dirname, `/render/tabs/admin/${tab}.ejs`))) {
        res.render(`tabs/admin/${tab.toString()}`);
    } else {
        res.render("dashboard", { "panel_title": config.panel_title, "token": "", other: {} });
    }
});

app.listen(config.port, () => {
    log.success(`Listening on port ${config.port}.`, "app.ts")
});