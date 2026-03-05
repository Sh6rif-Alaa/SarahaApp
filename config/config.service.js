import { resolve } from 'node:path'
import dotenv from 'dotenv'
dotenv.config({ path: resolve(`config/.env.${process.env.NODE_ENV}`) })

export const env = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    TOKEN_KEY: process.env.TOKEN_KEY,
    ENCRYPT_KEY: process.env.ENCRYPT_KEY,
    ENCRYPT_ALGORITHM: process.env.ENCRYPT_ALGORITHM,
    PREFIX: process.env.PREFIX,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    CLIENT_ID: process.env.CLIENT_ID,
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET
}