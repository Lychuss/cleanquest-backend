import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import type { Request, Response, NextFunction } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

import profileRouter from "./src/routers/profile.route.js";
import questRouter from "./src/routers/quest.route.js";
import characterRouter from "./src/routers/character.route.js";

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:3000",
            process.env.BETTER_AUTH_URL
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/cleanquest", profileRouter, questRouter, characterRouter);

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "Server is running!" });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if(err instanceof Error){
        return res.status(500).json({
            message: err.message,
            success: false
        });
    };

    return res.status(500).json({
        message: "Unknown Error",
        success: false
    });
});


export default app;