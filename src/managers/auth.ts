import express, { Request, Response, NextFunction } from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import config from "../../config.json" assert { type: "json" };
import "dotenv/config";
import cookieParser from "cookie-parser";
import * as log from "../utils/logger.js";
import { prisma } from "../app.js";
import bcrypt from "bcrypt";
import session from "express-session";

export const authRouter = express.Router();
authRouter.use(bodyparser.urlencoded({ extended: true }));
authRouter.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
authRouter.use(cookieParser());

const saltRounds = 10;

interface User {
    id: Number,
    createdAt: Date,
    email: string,
    username: string,
    admin: boolean,
}

declare module 'express-session' {
    interface SessionData {
        user: {
            id: Number
            admin: Boolean
        }
    }
}
export function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/authorize");
    }
}

export function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) return res.redirect("/authorize");
    if (req.session.user.admin) {
        next();
    } else {
        res.redirect("/");
    }
}

// RENDER

authRouter.get("/authorize", (req: Request, res: Response) => {
    res.render("authorize", { "panel_title": config.panel_title });
});

authRouter.get("/auth/login", (req: Request, res: Response) => {
    res.render("login", { "panel_title": config.panel_title, "additional_el": "" });
});

authRouter.get("/auth/register", (req: Request, res: Response) => {
    res.render("register", { "panel_title": config.panel_title, "additional_el": "" });
});

authRouter.get("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});

// POST

authRouter.post("/auth/login", async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        return res.render("login", { "panel_title": config.panel_title, "additional_el": '<div class="bg-[#ff0000] p-2 mb-3 rounded-lg"><p>Wrong credentials.<p></div>' });
    }
    bcrypt.compare(password, user.hashedPassword, async (err, result) => {
        if (err) {
            throw err;
        }
        if (result) {
            req.session.user = { id: user.id, admin: user.admin };
            res.render("dashboard", { "panel_title": config.panel_title, other: {} });
        } else {
            return res.render("login", { "panel_title": config.panel_title, "additional_el": '<div class="bg-[#ff0000] p-2 mb-3 rounded-lg"><p>Wrong credentials.<p></div>' });
        }
    });
});

authRouter.post("/auth/register", (req: Request, res: Response) => {
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
            req.session.user = { id: user.id, admin: user.admin };
            res.render("dashboard", { "panel_title": config.panel_title, other: {} });
            log.success(`User with ID ${user.id} got registered!`, "auth.ts");
        } else {
            return res.render("register", { "panel_title": config.panel_title, "additional_el": '<div class="bg-[#ff0000] p-2 mb-3 rounded-lg"><p>User already exists.<p></div>' });
        }
    });
});

authRouter.post("/auth/discord", (req: Request, res: Response) => {
    res.status(501).send("Not implemented.");
});

authRouter.get("/logout", (req: Request, res: Response) => {
    req.session.destroy((err: Error) => {
        if (err) {
            throw err;
        }
        res.redirect("/");
    });
});