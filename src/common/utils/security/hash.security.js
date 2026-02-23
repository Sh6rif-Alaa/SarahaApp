import { compareSync, hashSync } from "bcrypt";
import { env } from "../../../../config/config.service.js";

export const Hash = ({ plainText, salt = env.SALT_ROUNDS } = {}) => {
    return hashSync(plainText, Number(salt));
}

export const Compare = ({ plainText, hash } = {}) => {
    return compareSync(plainText, hash);
}