import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../../../lib/redis.js";

export const cache = (ttl = 60) => async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;

    try {

        const cached = await redisClient.get(key);

        if(cached != null){
            res.set("X-Cache", "HIT");
            return res.json(JSON.parse(cached));
        }

        
    } catch(err){
        console.error("Error caching", err);
        return next();
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
        redisClient
            .set(key, JSON.stringify(body), { EX: ttl })
            .catch((err) => console.error("Error converting the json", err))
        
        res.set("X-Cache", "MISS");
        return originalJson(body)
    }

    next();
}