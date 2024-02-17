import express, { Request, Response, NextFunction } from "express";
import config from "../../config.json" assert { type: "json" };

const router = express.Router();

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    next();
}

router.get("/authorize", (req: Request, res: Response) => {
    res.render("authorize", { "panel_title": config.panel_title });
});