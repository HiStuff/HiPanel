import express, { Request, Response, NextFunction } from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import * as log from "../utils/logger.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { prisma } from "../app.js";

export const userRouter = express.Router();
userRouter.use(bodyparser.json());
userRouter.use(cookieParser());

export async function getUserInfo(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
        prisma.user.findUnique({
            where: {
                id: id
            }
        }).then((user) => {
            resolve(user);
        }).catch(err => reject(err));
    })
}

export async function deleteUser(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
        prisma.user.delete({
            where: {
                id: id
            }
        }).then((user) => {
            resolve(user);
        }).catch(err => reject(err));
    })
}

// GET

userRouter.get("/api/user/:id", async (req: Request, res: Response) => {
    let id = req.params.id;
    const user = req.session.user;
    if (!user) return res.status(401);
    let userInfo;
    if (id == "me") {
        // ME
        id = user.id.toString();
        userInfo = await getUserInfo(Number(id));
    } else {
        // OTHER
        if (!user.admin) return res.status(403);
        userInfo = await getUserInfo(Number(id));
    };
    if (!userInfo) {
        return res.status(404).json({ message: "User doesn't exist." });
    }
    res.json(userInfo);
});

// DELETE

userRouter.delete("/api/user/:id", async (req: Request, res: Response) => {
    let id = req.params.id;
    const user = req.session.user;
    if (!user) return res.status(401);
    let userInfo;
    if (id == "me") {
        // ME
        id = user.id.toString();
        userInfo = await deleteUser(Number(id));
    } else {
        // OTHER
        if (!user.admin) return res.status(403).json({ message: "Permission Level too low." });
        userInfo = await deleteUser(Number(id));
    };
    if (!userInfo) {
        return res.status(404).json({ message: "User doesn't exist." });
    }
    log.success(`User with ID ${id} got deleted!`);
    res.json(userInfo);
});