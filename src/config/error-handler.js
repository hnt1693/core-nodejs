const AuthException = require("../exceptions/auth-exception")
const dayjs = require('dayjs')
const logger = require("../utils/logger")
const handleErrorAsync = func => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        next(error)
    }
};

const globalErrorHandler = function (err, req, res, next) {
    if (err) {
        if (err instanceof AuthException)
            res.status(err.status || 403).send({
                msg: err.message,
                type: err.name,
                timestamp: dayjs().format("YYYY/MM/DD HH:mm:ss")
            })
        else {
            res.status(err.status || 500).send({
                msg: err.message,
                type: err.name,
                timestamp: dayjs().format("YYYY/MM/DD HH:mm:ss")
            })
        }
    }
    logger.error(`[${err.name}] : ${err.message}`)
    next();
}

module.exports = {handleErrorAsync, globalErrorHandler}
