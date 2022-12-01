require('module-alias/register')
require("dotenv").config();
const express = require('express');
const contextService = require('request-context');
const DbHelper = require("@utils/db-helper")
const morganMiddleware = require("@config/logger-middleware");
const cors = require("@config/cors-middleware");
const serverConfig = require("@config/server-config-middleware");
const Exception = require("@exception/custom-exception");
const {globalErrorHandler} = require('@config/error-handler')
const authRouter = require('@routes/auth');
const usersRouter = require('@routes/users');
const fileStorageRouter = require('@routes/file-storage');
const logger = require("@utils/logger")
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 8000



//CONFIG
app.use(contextService.middleware('request'));
app.use(cors)
app.use(serverConfig)
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morganMiddleware)


//ROUTER
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/files', fileStorageRouter);
app.use('/public/flags', express.static('storage/public/flags'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(new Exception("API not found", "NotFoundException"));
});

//HANDLER ERROR
app.use(globalErrorHandler);



app.listen(PORT, () => {
    DbHelper.init();
    logger.info(`App is running at port ${PORT}`)
})
