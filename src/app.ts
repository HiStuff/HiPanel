import express, { NextFunction, Request, Response } from "express";
import * as log from "./utils/logger.js";
import "dotenv/config";

import config from "../config.json" assert { type: "json" };

const app = express();
app.set("view engine", "ejs");
app.set("views", "./render");

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    log.error(err.stack);
    res.status(500).send('An error occured while trying to handle your request.');
  })

app.get("/", (req, res) => {
    
})

app.listen(config.port, () => {
    log.success(`Listening on port ${config.port}.`, "app.ts")
});