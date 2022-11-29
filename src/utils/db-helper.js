const logger = require('./logger')
const HOST = process.env.DATABASE_HOST
const USERNAME = process.env.DATABASE_USERNAME
const PASSWORD = process.env.DATABASE_PASSWORD
const DBNAME = process.env.DATABASE_NAME

function connection() {
    try {
        const mysql = require('mysql2');
        const pool = mysql.createPool({
            host: HOST,
            user: USERNAME,
            password: PASSWORD,
            database: DBNAME,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0,
            trace: true,
            connectTimeout: 120,
        });
        logger.info(`Database connected successfully`)
        return pool.promise();
    } catch (error) {
        return console.log(`Could not connect - ${error}`);
    }
}

const executeWithTransaction = async function (callback) {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        logSql(conn);
        return await callback(conn);
    } catch (e) {
        logger.error("Can not transaction. Need to rollback for exception: " + e.message)
        await conn.query('ROLLBACK');
        throw e;
    } finally {
        await conn.release();
    }
}


const executeQuery = async function (callback) {
    const conn = await pool.getConnection();
    logSql(conn);
    return await callback(conn);
}

const pool = connection();

function logSql(conn) {
    conn.queryWithLog = async function (...params) {

        logger.sql("[" + params[0].replaceAll("\n", " ").replace(/\s+/g, ' ') + '] => Binding => [' + (params[1].join(", ")||'none') + "]")
        const [rows, fields] = await conn.query(params[0],params[1]);
        return rows;
    }
}


module.exports = {
    connection: async () => pool.getConnection(),
    executeQuery,
    executeQueryWithTransaction: executeWithTransaction,
};
