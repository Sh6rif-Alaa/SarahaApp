
import { createClient } from "redis"
import { env } from "../../../config/config.service.js";

export const redis_client = createClient({
    url: env.REDIS_URL
});

export const redisConnection = async () => {
    try {
        await redis_client.connect()
        console.log('redis connected Successfully')
    } catch (error) {
        console.log('redis Faild to connect', error)
    }
}