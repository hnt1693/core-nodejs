const winston = require('winston');
require('dotenv').config();
require('winston-daily-rotate-file');
const contextService = require('request-context');
// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn : 1,
    info : 2,
    http : 3,
    debug: 4,
    sql  : 5
};


// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
// const level = () => {
//     const env = process.env.NODE_ENV || 'development';
//     const isDevelopment = env === 'development';
//     return isDevelopment ? 'debug' : 'warn';
// };
const formatPrint = winston.format.printf(
    (info) => `${info.timestamp} [${(contextService
        .get('requestId') || 'Application').padStart(30, ' ')}]  [${info.level.padStart(25, ' ')}] ${info.message}`
);
const formatPrintFile = winston.format.printf(
    (info) => `${info.timestamp} [${(contextService
        .get('requestId') || 'Application').padStart(30, ' ')}]  [${info.level.padStart(6, ' ')}] ${info.message}`
);
// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: 'bold red',
    warn : 'bold yellow',
    info : 'bold cyan',
    http : 'bold blue',
    debug: 'bold white',
    sql  : 'bold white'
};

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console(
        {
            level : 'sql',
            format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.colorize({level: 'sql', colors: colors}),
                formatPrint
            )
        }
    ),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.DailyRotateFile({
        eol          : '\r\n',
        level        : 'sql',
        filename     : process.env.LOG_PATH + 'application-%DATE%.log',
        datePattern  : 'YYYY-MM-DD',
        zippedArchive: true,
        format       : winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            formatPrintFile,
            winston.format.colorize({all: false, level: 'sql'})
        ),
        maxSize: '20m'
    }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log(
    new winston.transports.File({
        level   : 'sql',
        filename: process.env.LOG_PATH + 'all.log',
        format  : winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            formatPrintFile,
            winston.format.colorize({all: false, level: 'sql'})
        )
    })
];

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
    // transports,
    levels,
    transports
});

logger.logWithThrown = (type, mes, thrown = null) => {
    logger.log(type, `[${thrown || ''}] ${mes}`);
};
module.exports = logger;
