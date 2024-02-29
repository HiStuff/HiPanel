import express, { Request, Response, NextFunction } from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import config from "../../config.json" assert { type: "json" };
import "dotenv/config";
import cookieParser from "cookie-parser";
import { prisma } from "../app.js";
import bcrypt from "bcrypt";

export const userRouter = express.Router();
userRouter.use(bodyparser.json());
userRouter.use(cookieParser());

const saltRounds = 10;

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

export async function getTokenData(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("No JWT_SECRET enviroment variable.");
        }
        jwt.verify(token, process.env.JWT_SECRET, async (err: any, decoded: any) => {
            if (err) {
                reject(err);
            }
            resolve(decoded.data);
        });
    });
}

// GET

userRouter.get("/api/user/:id", async (req: Request, res: Response) => {
    let id = req.params.id;
    if (req.params.id != "me") {
        id = req.params.id;
    }
    const token = req.headers.authorization;
    if (!token) return res.status(401);
    let userInfo;
    if (id != "me") {
        if ((await getTokenData(token)).permissionLevel < 2) return res.status(403).json({ message: "Permission Level too low." });
        userInfo = await getUserInfo(Number(id));
    } else {
        id = (await getTokenData(token)).id
        userInfo = await getUserInfo(Number(id));
    };
    if (!userInfo) {
        return res.status(404).json({ message: "User doesn't exist." });
    }
    res.json(userInfo);
});