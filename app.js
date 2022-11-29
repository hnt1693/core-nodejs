require('module-alias/register')
require("dotenv").config();
const express = require('express');
const morganMiddleware = require("./src/config/logger-middleware");
const cors = require("./src/config/cors-middleware");
const serverConfig = require("./src/config/server-config-middleware");
const Exception = require("@exception/custom-exception");
const {globalErrorHandler} = require('./src/config/error-handler')
const authRouter = require('./src/routes/auth');
const usersRouter = require('./src/routes/users');
const fileStorageRouter = require('./src/routes/file-storage');
const logger = require("./src/utils/logger")
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 8000

//CONFIG
app.use(serverConfig)
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors)
app.use(morganMiddleware)


//ROUTER
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/files', fileStorageRouter);
app.use('/public/flags', express.static('storage/public/flags'))
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(new Exception("API not found","NotFoundException"));
});

//HANDLER ERROR
app.use(globalErrorHandler);


app.listen(PORT, () => {
    logger.info(`App is running at port ${PORT}`)
})
