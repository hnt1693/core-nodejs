const logger = require("../utils/logger")
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
            trace: true
        });
        return pool.promise();
    } catch (error) {
        return console.log(`Could not connect - ${error}`);
    }
}

const executeWithTransaction = async function (callback) {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
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
    return await callback(conn);
}

const execute = async (...params) => {
    return await pool.execute(...params)
}

const pool = connection();

module.exports = {
    connection: async () => pool.getConnection(),
    executeQuery,
    executeQueryWithTransaction: executeWithTransaction,
};
