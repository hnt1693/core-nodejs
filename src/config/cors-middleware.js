const ORIGINS = ['localhost:8080', '127.0.0.1:8080', '*']
const METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
const {EXCEPTION_TYPES, Exception} = require("../exceptions/custom-exception")
const contextService = require('request-context');
const cuid = require('cuid');
const cors = function (req, res, next) {
    //add request id
    contextService.set('requestId', cuid())
    if (!ORIGINS.includes("*") && !ORIGINS.includes(req.headers.host)) {
        next(new Exception("Origin not allowed", EXCEPTION_TYPES.CORS).bind("cors"))
    }
    if (!METHODS.includes(req.method)) {
        next(new Exception("Method not allowed. Support only " + METHODS.join(", "), EXCEPTION_TYPES.CORS).bind("cors"))
    }
    next();
}

module.exports = cors;
