const {Exception, EXCEPTION_TYPES} = require('@exception/custom-exception');
const API_TIMEOUT = 120 * 1000;

const config = (req, res, next) => {
    // Set the timeout for all HTTP requests
    req.setTimeout(API_TIMEOUT, () => {
        const err = new Exception('Request Timeout', EXCEPTION_TYPES.CORS);
        err.status = 408;
        next(err);
    });

    // Set the server response timeout for all HTTP requests
    res.setTimeout(API_TIMEOUT, () => {
        const err = new Exception('Server Timeout', 'ServerTimeOutException');
        err.status = 503;
        next(err);
    });
    next();
};
module.exports = config;
