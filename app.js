const createError = require('http-errors');
const express = require('express');
const morganMiddleware = require("./config/logger-middleware");
const cors = require("./config/cors-middleware");
require("dotenv").config();
const indexRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const {globalErrorHandler} = require('./config/error-handler');
const app = express();
const PORT = process.env.PORT || 8000


app.use(cors)
app.use(morganMiddleware)
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/users', usersRouter);
app.use('/auth', indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


app.use(globalErrorHandler);


app.listen(PORT, () => {
    console.log(`LISTING AT PORT  ${PORT}`)
})
