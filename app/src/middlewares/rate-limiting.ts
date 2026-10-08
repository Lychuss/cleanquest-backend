import { RedisStore } from "rate-limit-redis";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { redisClient } from "../../../lib/redis.js";

const makeStore = (prefix: string) => 
    new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
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

export default apiLimiter;