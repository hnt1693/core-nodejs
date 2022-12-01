const ORIGINS = ['localhost:8080', 'http://example1.com', 'http://example2.com']
const METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
const Exception = require("../exceptions/custom-exception")
const contextService = require('request-context');
const cuid = require('cuid');
const cors = function (req, res, next) {
    //add request id
    contextService.set('requestId', cuid())
    if (!ORIGINS.includes(req.headers.host)) {
        next(new Exception("Origin not allowed", "CorsException"))
    }
    if (!METHODS.includes(req.method)) {
        next(new Exception("Method not allowed. Support only " + METHODS.join(", "), "CorsException"))
    }
    next();
}

module.exports = cors;
