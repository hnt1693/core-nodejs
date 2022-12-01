const DBHelper = require("../utils/db-helper")
const {UserMapping, getColumns} = require("../mapping/user-mapping");
const AuthException = require("../exceptions/auth-exception");
const {Exception, EXCEPTION_TYPES} = require("../exceptions/custom-exception");
const {hashPassword, verifyPasswordWithHash} = require("../utils/password-encrypt");
const {StringBuilder} = require("@utils/ultil-helper");
const {make} = require('simple-body-validator');

const userLoginRules = {
    username: 'required|string|min:3',
    password: 'required|min:5'
};
const userRegisterRules = {
    username: 'required|string|min:3',
    password: 'required|min:5',
    email: 'required|email'
};

const getUsers = (page = 0, limit = 10, search, fields) => {
    return DBHelper.executeQuery(async (connection) => {
        return await connection.queryWithLog({
            sql: `SELECT ${getColumns(fields, UserMapping)}
                  FROM users u limit ?
                  offset ?`,
            rowsAsArray: false,
            values: [parseInt(limit), page * limit]
        })
    })
}

const login = (body) => {
    return DBHelper.executeQuery(async connection => {
        const validator = make(body, userLoginRules);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Exception(validator.errors().first(), EXCEPTION_TYPES.AUTH).bind('login=>Validate');
        }
        let user = await connection.queryWithLog({
            sql: `SELECT *
                  FROM users u
                  where u.username = ?`,
            rowsAsArray: false,
            values: [body.username]
        });
        if (user.length === 0) {
            throw new Exception("Username password is not valid", EXCEPTION_TYPES.AUTH).bind('login=>getUser');
        }
        user = user[0];
        await verifyPasswordWithHash(body.password, user.password)
        delete user.password;
        return user;
    })

}

const register = (body) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        const validator = make(body, userRegisterRules);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Exception(validator.errors().first(), EXCEPTION_TYPES.AUTH).bind('register=>Validate');
        }
        try{
            let user = await connection.queryWithLog({
                sql: `INSERT INTO users(username, password, email)
                      VALUE(?,?,?)`,
                rowsAsArray: false,
                values: [body.username, await hashPassword(body.password), body.email]
            });
            return user.insertId;
        }catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.AUTH).bind('register=>InsertUser');
        }


    })
}

const getInfo = async (username) => {
    return DBHelper.executeQuery(async connection => {
        let user = await connection.queryWithLog({
            sql: `SELECT ${getColumns(["userId", "username", "email", "type"], UserMapping)}  FROm users WHERE username = ?`,
            values: [username]
        })
        user = user[0];
        if (!user) {
            throw new Exception("User not found", EXCEPTION_TYPES.NOT_FOUND).bind('getInfo=>getUser');
        }
        return user;
    })

}


module.exports = {login, getUsers, getInfo, register}
