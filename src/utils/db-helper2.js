const DataTypes = require("sequelize");
const {Sequelize} = require("sequelize")
const logger = require("@utils/logger")
const HOST = process.env.DATABASE_HOST
const USERNAME = process.env.DATABASE_USERNAME
const PASSWORD = process.env.DATABASE_PASSWORD
const DBNAME = process.env.DATABASE_NAME

const sequelize = new Sequelize(DBNAME, USERNAME, PASSWORD, {
    host: "localhost",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: (sql, timing) => {
        logger.sql(`${sql} => ${timing.bind}`)
    }
});

const init = () => {
    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');

    }).catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });
}
const executeWithTransaction = async (callback) => {
    const transaction = await sequelize.transaction();
    try {
        let data = await callback(transaction);
        await transaction.commit();
        return data;
    } catch (e) {
        await transaction.rollback();
    }
}

const execute = async (callback) => {
    await callback();
}

module.exports = {init, executeWithTransaction, execute, sequelize}