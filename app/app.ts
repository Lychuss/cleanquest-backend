import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { RedisStore} from "rate-limit-redis";
import { createClient } from "redis";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import cors from "cors";

import type { Request, Response, NextFunction } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

import type { RedisClient } from "./src/types/redis.js";

import profileRouter from "./src/routers/profile.route.js";
import questRouter from "./src/routers/quest.route.js";
import characterRouter from "./src/routers/character.route.js";

const app = express();
let redisCLient: RedisClient;

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:3000",
            process.env.BETTER_AUTH_SECRET,
            "https://cleanquest-frontend.vercel.app",
            process.env.VERCEL_BASE_URL,
            "127.0.0.1"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.set("trust proxy", 1);

if(process.env.REDIS_URL){
    redisCLient = createClient({ url: process.env.REDIS_URL })
    await redisCLient.connect()
}

const makeStore = (prefix: string) => 
    new RedisStore({
            sendCommand: (...args) => redisCLient.sendCommand(args),
            prefix: `rl:${prefix}:`
        })

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: makeStore('api'),
    keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? 'unkown'),
    handler: (req, res) => {
        res.status(429).json({ error: "Too many request!"})
    }
})

app.use("/cleanquest", apiLimiter, profileRouter, questRouter, characterRouter);

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
