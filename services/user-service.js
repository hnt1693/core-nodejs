const DBHelper = require("../utils/db-helper")
const {UserMapping, getColumns} = require("../mapping/user-mapping");
const AuthException = require("../exceptions/auth-exception");
const {hashPassword, verifyPasswordWithHash} = require("../utils/password-encrypt");
const {make} = require('simple-body-validator');
const userLogin = {
    username: 'required|string|min:3',
    password: 'required|min:5'
};
const userRegister = {
    username: 'required|string|min:3',
    password: 'required|min:5',
    email: 'required'
};
const logger = require('./../utils/logger')

const getUsers = (page, limit, search, fields) => {
    return DBHelper.executeQueryWithTransaction((connection) => {
        return connection.query(`SELECT ${getColumns(fields, UserMapping)}
                                 FROM user u
                                 where u.user_name like ? limit ?
                                 offset ?`, [`%${search}%`, limit, page * limit])
    })
}

const login = (body) => {
    return DBHelper.executeQuery(async connection => {
        const validator = make(body, userLogin);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new AuthException(validator.errors().first());
        }

        let [user] = await connection.query({
            sql: `SELECT *
                  FROM users u
                  where u.username = ?`,
            rowsAsArray: false,
            values: [body.username]
        });
        if (user.length === 0) {
            throw new AuthException("Username password is not valid");
        }
        user = user[0];
        await verifyPasswordWithHash(body.password, user.password)
        delete user.password;
        return user;
    })

}

const register = (body) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        const validator = make(body, userRegister);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Error(validator.errors().first());
        }
        let [user] = await connection.query({
            sql: `INSERT INTO users(username, password, email)
                      VALUE(?,?,?)`,
            rowsAsArray: false,
            values: [body.username, await hashPassword(body.password), body.email]
        });
        return user.insertId;
    })
}

const getInfo = async (username) => {
    let [user] = await DBHelper.execute(`SELECT ${getColumns(["userId", "username", "email", "status", "customerId", "createdAt", "updatedAt"], UserMapping)}  FROm user WHERE user_name = ?`, [username])
    user = user[0];
    if (!user) {
        throw new Error("Not found")
    }
    return user;
}


module.exports = {login, getUsers, getInfo, register}
