require('module-alias/register');
require('dotenv').config();
const express = require('express');
const contextService = require('request-context');
const morganMiddleware = require('@config/logger-middleware');
const cors = require('@config/cors-middleware');
const serverConfig = require('@config/server-config-middleware');
const {Exception, EXCEPTION_TYPES} = require('@exception/custom-exception');
const DBHelper2 = require('@utils/db-helper2');
const {globalErrorHandler} = require('@config/error-handler');
const authRouter = require('@routes/auth');
const usersRouter = require('@routes/users');
const matchRouter = require('@routes/match');
const predictRouter = require('@routes/predicts');
const fileStorageRouter = require('@routes/file-storage');
const Cronjob = require('@config/cronjob');
const logger = require('@utils/logger');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8000;

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const swaggerOptions = {
  swaggerOptions: {
    validatorUrl: null
  }
};

app.use('/api-docs', swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions));
// CONFIG
app.use(contextService.middleware('request'));
app.use(cors);
app.use(serverConfig);
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morganMiddleware);

// ROUTER
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/files', fileStorageRouter);
app.use('/match', matchRouter);
app.use('/predict', predictRouter);
app.use('/storage/public/avatar', express.static('storage/public/avatar'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new Exception('API not found', EXCEPTION_TYPES.NOT_FOUND));
});

// HANDLER ERROR
app.use(globalErrorHandler);

app.listen(PORT, () => {
  // DbHelper.init();
  Cronjob.initial();
  DBHelper2.init();
  logger.info(`App is running at port ${PORT}`);
});
