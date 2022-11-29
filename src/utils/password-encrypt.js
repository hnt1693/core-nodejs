const argon2 = require("argon2")
const crypto = require("crypto")
const AuthException = require("../exceptions/auth-exception")

const hashingConfig = { // based on OWASP cheat sheet recommendations (as of March, 2022)
    parallelism: 1,
    memoryCost: 64000, // 64 mb
    timeCost: 3 // number of itetations
}

async function hashPassword(password) {
    let salt = crypto.randomBytes(16);
    return await argon2.hash(password, {
        ...hashingConfig,
        salt,
    })
}

async function verifyPasswordWithHash(password, hash) {
    try {
        let res = await argon2.verify(hash, password, hashingConfig);
        if (!res) {
            throw new Error();
        }
    } catch (e) {
        console.log(e)
        throw new AuthException("Username or password not valid")
    }
}

module.exports = {hashPassword, verifyPasswordWithHash}
