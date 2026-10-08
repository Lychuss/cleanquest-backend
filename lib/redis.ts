
import { createClient } from "redis";
import type { RedisClient } from "../app/src/types/redis.js";

export let redisClient: RedisClient;

if(process.env.REDIS_URL){
    redisClient = createClient({ url: process.env.REDIS_URL })

    redisClient.on('error', (err) => {
        console.error("Redis Error", err)
    })

    await redisClient.connect()
}
