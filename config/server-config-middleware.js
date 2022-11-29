const Exception = require('@exception/custom-exception')
const API_TIMEOUT = 120 * 1000;

const config = (req, res, next) => {

    // Set the timeout for all HTTP requests
    req.setTimeout(API_TIMEOUT, () => {
        let err = new Exception('Request Timeout', "RequestTimeOutException");
        err.status = 408;
        next(err);
    });

    // Set the server response timeout for all HTTP requests
    res.setTimeout(API_TIMEOUT, () => {
        let err = new Exception('Server Timeout', "ServerTimeOutException");
        err.status = 503;
        next(err);
    });
    next()
}
module.exports = config