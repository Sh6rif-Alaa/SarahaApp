import { compareSync, hashSync } from "bcrypt";

export const Hash = ({ plainText, salt = 12 } = {}) => {
    return hashSync(plainText, salt);
}

export const Compare = ({ plainText, hash } = {}) => {
    return compareSync(plainText, hash);
}