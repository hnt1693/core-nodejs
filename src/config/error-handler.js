const {Exception} = require("@exception/custom-exception")
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
        if (err instanceof Exception)
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
    logger.logWithThrown('error',`[${err.name}] : ${err.message}`, err.thrown)
    next();
}

module.exports = {handleErrorAsync, globalErrorHandler}
