import crypto from 'node:crypto';

const key = "qwghjyumi12638ikhb7'yr@%^5yhi&@r";

export function encrypt({ text } = {}) {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')

    encrypted += cipher.final('hex')

    return iv.toString('hex') + ":" + encrypted
}

export function decrypt({ cipherText } = {}) {
    const ivBuffer = Buffer.from(cipherText.split(':')[0], 'hex')

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), ivBuffer)

    let decrypted = decipher.update(cipherText.split(':')[1], 'hex', 'utf8')

    decrypted += decipher.final('utf8')

    return decrypted
}