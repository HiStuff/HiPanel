import express, { Request, Response, NextFunction } from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import config from "../../config.json" assert { type: "json" };
import "dotenv/config";

if (!process.env.SESSION_SECRET) {
    throw new Error("No SESSION_SECRET enviroment variable.");
}

export const router = express.Router();
router.use(bodyparser.urlencoded({ extended: true }));

function generateJWT(username: string): string {
    if (!process.env.JWT_SECRET) {
        throw new Error("No JWT_SECRET enviroment variable.");
    }
    return jwt.sign({ data: {
        username: username,
        permissionLevel: 1
    } }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (false) {
        next()
    } else {
        res.redirect("/authorize");
    }
}

// RENDER

router.get("/authorize", (req: Request, res: Response) => {
    res.render("authorize", { "panel_title": config.panel_title });
});

router.get("/auth/jwt_login", (req: Request, res: Response) => {
    res.render("jwt_login", { "panel_title": config.panel_title });
});

router.get("/auth/jwt_register", (req: Request, res: Response) => {
    res.render("jwt_register", { "panel_title": config.panel_title });
});

router.get("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});

// POST

router.post("/auth/jwt_login", (req: Request, res: Response) => {
    console.log(req.headers.authorization);
    const username: string = req.body.username;
    const password: string = req.body.password;
    const token = generateJWT(username);
    res.render("dashboard", { "panel_title": config.panel_title, token: token });
});

router.post("/auth/jwt_register", (req: Request, res: Response) => {
    //
});

router.post("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});