const DBHelper = require("../utils/db-helper")
const {UserMapping, getColumns, FileMapping} = require("../mapping/user-mapping");
const {Exception, EXCEPTION_TYPES} = require("../exceptions/custom-exception");
const {hashPassword, verifyPasswordWithHash} = require("../utils/password-encrypt");
const {ROLE} = require("@config/auth-middleware");
const {make} = require('simple-body-validator');
const {uploadAvatar, removeFiles} = require('@service/file-svc');
const requestContext = require('request-context');
const {encode} = require("@service/jwt")
const userLoginRules = {
    username: 'required|string|min:5',
    password: 'required|min:6'
};
const userRules = {
    username: 'required|string|min:5',
    password: 'required|min:6',
    email: 'required|email',
    fullName: 'min:8'
};
const userUpdateRules = {
    email: 'email',
    fullName: 'min:8'
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
            sql: `SELECT ${getColumns(["userId", "username", "fullName", "email", "avatar", "password"], UserMapping)}
                  FROM users u
                  where u.username = ?`,
            rowsAsArray: false,
            values: [body.username]
        });
        if (user.length === 0) {
            throw new Exception("Username password is not valid", EXCEPTION_TYPES.AUTH).bind('login=>getUser');
        }
        user = user[0];
        user.avatar = await connection.join({
            table: "files",
            joinColumn: "id",
            columns: getColumns(["id", "path", "originalName", "mimeType", "encoding", "size", "fileName"], FileMapping),
            joinValue: user.avatar,
            unique: true
        })
        await verifyPasswordWithHash(body.password, user.password)
        delete user.password;
        user.accessToken = encode(user)
        return user;
    })

}

const register = (body) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        const validator = make(body, userRules);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Exception(validator.errors().first(), EXCEPTION_TYPES.AUTH).bind('register=>Validate');
        }
        try {
            let user = await connection.queryWithLog({
                sql: `INSERT INTO users(username, password, email, fullname, type)
                          VALUE(?,?,?,?,?)`,
                rowsAsArray: false,
                values: [body.username, await hashPassword(body.password), body.email, body.fullName || '', ROLE.USER]
            });
            return user.insertId;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.AUTH).bind('register=>InsertUser');
        }
    })
}

const getInfo = async (username) => {
    return DBHelper.executeQuery(async connection => {
        let user = await connection.queryWithLog({
            sql: `SELECT ${getColumns(["userId", "username", "fullName", "email", "avatar", "password"], UserMapping)}
                  FROM users
                  WHERE username = ?`,
            values: [username]
        })
        user = user[0];
        delete user.password;
        if (!user) {
            throw new Exception("User not found", EXCEPTION_TYPES.NOT_FOUND).bind('getInfo=>getUser');
        }
        if(user.avatar){
            user.avatar = await connection.join({
                table: "files",
                joinColumn: "id",
                columns: getColumns(["id", "path", "originalName", "mimeType", "encoding", "size", "fileName"], FileMapping),
                joinValue: user.avatar,
                unique: true
            })
        }
        return user;
    })
}

const changeAvatar = (req, res) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        let user = requestContext.get('request:user')
        let file = await uploadAvatar(req, res);
        let data = await connection.queryWithLog(
            {
                sql: `UPDATE users
                      set avatar_id = ?
                      WHERE id = ?`
                , values: [file.sqlResult.insertId, user.userId]
            },
        )
        if (user.avatar) {
            removeFiles([user.avatar])
        }
        return {avatarId: file.sqlResult.insertedId};
    })
}

const updateInfo = (body) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        const validator = make(body, userUpdateRules);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Exception(validator.errors().first(), EXCEPTION_TYPES.DATA_INVALID).bind('updateInfo=>Validate');
        }

        try {
            let user = await connection.queryWithLog({
                sql: `UPDATE users SET email =?, fullname=?
                          WHERE id=?`,
                rowsAsArray: false,
                values: [body.email, body.fullName, await requestContext.get('request.user').userId]
            });
            return user.insertId;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind('register=>InsertUser');
        }

    })
}


module.exports = {login, getUsers, getInfo, register, changeAvatar, updateInfo}
