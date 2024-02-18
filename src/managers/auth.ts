import express, { Request, Response, NextFunction } from "express";
import config from "../../config.json" assert { type: "json" };

export const router = express.Router();

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (false) {
        next()
    } else {
        res.redirect("/authorize");
    }
}

router.get("/authorize", (req: Request, res: Response) => {
    res.render("authorize", { "panel_title": config.panel_title });
});