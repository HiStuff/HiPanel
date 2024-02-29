import express, { Request, Response, NextFunction } from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import config from "../../config.json" assert { type: "json" };
import "dotenv/config";
import cookieParser from "cookie-parser";
import * as log from "../utils/logger.js";
import { prisma } from "../app.js";
import bcrypt from "bcrypt";

export const authRouter = express.Router();
authRouter.use(bodyparser.urlencoded({ extended: true }));
authRouter.use(cookieParser());

const saltRounds = 10;

function generateJWT(id: number, email: string, username: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("No JWT_SECRET enviroment variable.");
        }
        jwt.sign({ data: {
            id: id,
            email: email,
            username: username,
            permissionLevel: 1
        } }, process.env.JWT_SECRET, { expiresIn: "7d" }, ((err, token) => {
            if (err || !token) {
                throw err;
            }
            resolve(token)
        }));
    })
}

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (!process.env.JWT_SECRET) {
        throw new Error("No JWT_SECRET enviroment variable.");
    }
    const token = req.cookies.token;
    if (!token) { res.redirect("/authorize"); return; }
    jwt.verify(token, process.env.JWT_SECRET, ((err: any, decoded: any) => {
        if (err) {
            res.redirect("/authorize");
            return;
        }
        next();
    }));
}

// RENDER

authRouter.get("/authorize", (req: Request, res: Response) => {
    res.render("authorize", { "panel_title": config.panel_title });
});

authRouter.get("/auth/jwt_login", (req: Request, res: Response) => {
    res.render("jwt_login", { "panel_title": config.panel_title });
});

authRouter.get("/auth/jwt_register", (req: Request, res: Response) => {
    res.render("jwt_register", { "panel_title": config.panel_title });
});

authRouter.get("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});

// POST

authRouter.post("/auth/jwt_login", async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        return res.send("User doesn't exist.");
    }
    bcrypt.compare(password, user.hashedPassword, async (err, result) => {
        if (err) {
            throw err;
        }
        if (result) {
            const token = await generateJWT(user.id, user.email, user.username);
            res.render("dashboard", { "panel_title": config.panel_title, token: token });
        } else {
            res.send("Wrong password.");
        }
    });
});

authRouter.post("/auth/jwt_register", (req: Request, res: Response) => {
    const email: string = req.body.email;
    const username: string = req.body.username;
    const password: string = req.body.password;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
            throw err;
        }
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        if (!user) {
            const user = await prisma.user.create({
                data: {
                    email: email,
                    username: username,
                    hashedPassword: hash
                }
            });
            const token = await generateJWT(user.id, email, username);
            res.render("dashboard", { "panel_title": config.panel_title, token: token });
        } else {
            return res.send("User already exists.");
        }
    });
});

authRouter.post("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});