const jwt = require('jsonwebtoken');
const SECRET = process.env.AUTH_SECRET
const encode = (user) => {
    return jwt.sign(user, SECRET, {expiresIn: '10m'})
}
const verify = (token) => {
    return jwt.verify(token, SECRET);
}

module.exports = {verify, encode}
