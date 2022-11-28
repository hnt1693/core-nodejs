const winston = require('winston');
require("dotenv").config();
require('winston-daily-rotate-file');
// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}
// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'white',
}

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console(
        {
            format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.colorize({level: true }),
                winston.format.printf(
                    (info) => `${info.timestamp} [${info.level}] ${info.message}`
                ),
            )
        }
    ),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.DailyRotateFile({
        eol: "\r\n",
        filename: process.env.LOG_PATH + 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        format: winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            winston.format.printf(
                (info) => `${info.timestamp} [${info.level}] ${info.message}`
            ),
            winston.format.colorize({all: false}),
        ),
        maxSize: '20m'
    }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log(
    new winston.transports.File({
        eol: "\r\n",
        filename: process.env.LOG_PATH + 'all.log',
        format: winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            winston.format.printf(
                (info) => `${info.timestamp} [${info.level}] ${info.message}`
            ),
            winston.format.colorize({all: false}),
        )
    }),
]

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
})


module.exports = logger
