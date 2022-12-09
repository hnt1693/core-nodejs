const {Sequelize} = require('sequelize');
const logger = require('@utils/logger');
// const HOST = process.env.DATABASE_HOST;
const USERNAME = process.env.DATABASE_USERNAME;
const PASSWORD = process.env.DATABASE_PASSWORD;
const DBNAME = process.env.DATABASE_NAME;

const sequelize = new Sequelize(DBNAME, USERNAME, PASSWORD, {
    host   : 'localhost',
    dialect: 'mysql',
    pool   : {
        max    : 5,
        min    : 0,
        acquire: 30000,
        idle   : 10000
    },
    logging: (sql, timing) => {
        logger.sql(`${sql} => ${timing.bind || '[]'}`);
    }
});

const init = () => {
    sequelize.authenticate().then(async () => {
        logger.info('Connection has been established successfully.');

        await require('@mapping/user-model').User.sync();
        await require('@mapping/file-model').File.sync();
        await require('@mapping/team.model').Team.sync();
        await require('@mapping/match.model').Match.sync();
        await require('@mapping/predict.model').Predict.sync();
    }).catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });
};
const executeWithTransaction = async (callback, showLog = true) => {
    const transaction = await sequelize.transaction({logging: showLog});
    try {
        const data = await callback(transaction);
        await transaction.commit({logging: showLog});
        return data;
    } catch (e) {
        await transaction.rollback({logging: showLog});
        throw e;
    }
};

const execute = async (callback) => {
    try {
        return await callback();
    } catch (e) {
        throw e;
    }
};

module.exports = {init, executeWithTransaction, execute, sequelize};
