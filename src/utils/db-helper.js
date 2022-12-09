const logger = require('./logger');
const HOST = process.env.DATABASE_HOST;
const USERNAME = process.env.DATABASE_USERNAME;
const PASSWORD = process.env.DATABASE_PASSWORD;
const DBNAME = process.env.DATABASE_NAME;
let pool;

function init() {
    if (!pool) {
        pool = connection();
    }
}

function connection() {
    try {
        const mysql = require('mysql2');
        const pool = mysql.createPool({
            host              : HOST,
            user              : USERNAME,
            password          : PASSWORD,
            database          : DBNAME,
            connectionLimit   : 100,
            waitForConnections: true,
            queueLimit        : 0,
            trace             : true,
            connectTimeout    : 120
        });
        logger.logWithThrown('info', 'Database connected successfully', 'DBHelper');
        return pool.promise();
    } catch (error) {
        return console.log(`Could not connect - ${error}`);
    }
}

const executeWithTransaction = async function(callback) {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        logSql(conn);
        join(conn);
        const res = await callback(conn);
        await conn.query('COMMIT');
        return res;
    } catch (e) {
        logger.error('Can not transaction. Need to rollback for exception: ' + e.message);
        await conn.query('ROLLBACK');
        throw e;
    } finally {
        await conn.release();
    }
};


const executeQuery = async function(callback) {
    const conn = await pool.getConnection();
    logSql(conn);
    join(conn);
    const data = await callback(conn);
    conn.release();
    return data;
};


function logSql(conn) {
    conn.queryWithLog = async function(params) {
        logger.sql('[' + params.sql
            .replaceAll('\n', ' ')
            .replace(/\s+/g, ' ') + '] => Binding => [' + (params.values.join(' | ') || 'none') + ']');

        const [rows] = await conn.query(params);
        return rows;
    };
}

function join(conn) {
    conn.join = async function(joinOptions) {
        logger.sql(`SELECT ${joinOptions.columns} 
        FROM ${joinOptions.table} where ${joinOptions.joinColumn}=${joinOptions.joinValue}`);
        const [rows] = await conn
            .query(`SELECT ${joinOptions.columns} 
            FROM ${joinOptions.table} where ${joinOptions.joinColumn}=?`, [joinOptions.joinValue]);
        if (joinOptions.unique) return rows[0] || null;
        return rows;
    };
}


module.exports = {
    connection                 : async () => pool.getConnection(),
    executeQuery,
    executeQueryWithTransaction: executeWithTransaction,
    init
};
