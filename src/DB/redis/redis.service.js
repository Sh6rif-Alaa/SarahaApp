import { redis_client } from "./redis.connect.js"

export const revoke_key = ({ userId, jti }) => {
    return `revoke_token::${userId}::${jti}`
}

export const otp_key = ({ email, subject = "confirmEmail" }) => {
    return `otp::${subject}::${email}`
}

export const max_otp_key = ({ email, subject = "confirmEmail" }) => {
    return `otp_max::${subject}::${email}`
}

export const blocked_otp_key = ({ email, subject = "confirmEmail" }) => {
    return `otp_blocked::${subject}::${email}`
}

export const get_revoke_key = (userId) => {
    return `revoke_token::${userId}`
}

export const get_profile_key = (userId) => {
    return `profile::${userId}`
}

export const setValue = async ({ key, value, ttl } = {}) => {
    try {
        const data = typeof value == "string" ? value : JSON.stringify(value)
        return ttl ? await redis_client.set(key, data, { EX: ttl }) : await redis_client.set(key, data)
    } catch (error) {
        console.log('error setting value in redis', error)
    }
}

export const updateValue = async ({ key, value, ttl } = {}) => {
    try {
        if (!exists(key)) return 0
        return await setValue({ key, value, ttl })
    }
    catch (error) {
        console.log('error updating value in redis', error)
    }
}

export const getValue = async (key) => {
    try {
        const value = await redis_client.get(key)
        if (!value) return null

        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    } catch (error) {
        console.log('error getting value from redis', error)
    }
}

export const ttl = async (key) => {
    try {
        return await redis_client.ttl(key)
    } catch (error) {
        console.log('error getting ttl from redis', error)
    }
}

export const expire = async ({ key, ttl } = {}) => {
    try {
        return await redis_client.expire(key, ttl)
    } catch (error) {
        console.log('error getting expire from redis', error)
    }
}

export const exists = async (key) => {
    try {
        return await redis_client.exists(key)
    } catch (error) {
        console.log('error getting exists from redis', error)
    }
}

export const del = async (key) => {
    try {
        if (!key.length) return 0
        return await redis_client.del(key)
    } catch (error) {
        console.log('error getting del from redis', error)
    }
}

export const keys = async (pattern) => {
    try {
        return await redis_client.keys(`${pattern}*`)
    } catch (error) {
        console.log('error getting keys from redis', error)
    }
}

export const incr = async (key) => {
    try {
        return await redis_client.incr(key)
    } catch (error) {
        console.log("error incrementing value in redis", error)
        throw error
    }
}