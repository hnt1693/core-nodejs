const morgan = require('morgan');
const logger = require('@utils/logger');
const split = require('split');

const stream = split().on('data', function(message) {
  logger.http(message);
});

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(
    ':remote-addr :method :url :status :res[content-length] - :response-time ms',
    {stream, skip});

module.exports = morganMiddleware;
