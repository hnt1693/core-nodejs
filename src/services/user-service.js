const DBHelper2 = require('../utils/db-helper2');
const {Op} = require('sequelize');
const {Exception, EXCEPTION_TYPES} = require('../exceptions/custom-exception');
const {hashPassword, verifyPasswordWithHash} = require('../utils/password-encrypt');
const {ROLE} = require('@config/auth-middleware');
const {User} = require('@mapping/user-model');
const {File, FILE_TYPES} = require('@mapping/file-model');
const {uploadAvatar, removeFiles} = require('@service/file-svc');
const requestContext = require('request-context');
const {encode} = require('@service/jwt');

const getUsers = (page = 0, limit = 10, search, fields) => {
    return DBHelper2.execute(async () => {
        const data = await User.findAll({
            limit,
            offset : page * limit,
            include: [
                {
                    model: File,
                    as   : 'avatar'
                }
            ]
        });
        return data;
    });
};

const login = (body) => {
    return DBHelper2.execute(async () => {
        let user = await User
            .scope(['withPassword'])
            .findOne({
                where  : {username: body.username},
                include: [
                    {
                        model: File,
                        as   : 'avatar',
                        on   : {
                            'user_id': {[Op.eq]: DBHelper2.sequelize.col('users.id')},
                            'type'   : {
                                [Op.or]: [FILE_TYPES.AVATAR, null]
                            }
                        }
                    }
                ]
            });
        if (!user) {
            throw new Exception('User not found', EXCEPTION_TYPES.AUTH).bind('[login]');
        }
        user = user.dataValues;
        await verifyPasswordWithHash(body.password, user.password);
        delete user.password;
        user.accessToken = encode(user);
        return user;
    });
};

const register = (body) => {
    return DBHelper2.executeWithTransaction(async (transaction) => {
        try {
            const user = await User.create({
                ...body,
                password: await hashPassword(body.password),
                type    : ROLE.USER
            }, {transaction});
            await user.save();
            const data = user.dataValues;
            delete data.password;
            return data;
        } catch (e) {
            if (e.errors) {
                throw new Exception(e.errors[0].message, EXCEPTION_TYPES.DATA_INVALID).bind('register=>InsertUser');
            } else {
                throw e;
            }
        }
    });
};

const getInfo = async (currentUser) => {
    return DBHelper2.execute(async () => {
        const user = await User.findOne({
            where  : {username: currentUser.username},
            include: [
                {
                    model: File,
                    as   : 'avatar',
                    on   : {
                        'user_id': {[Op.eq]: DBHelper2.sequelize.col('users.id')},
                        'type'   : {
                            [Op.or]: [FILE_TYPES.AVATAR, null]
                        }
                    }
                }
            ]
        });
        if (!user) {
            throw new Exception('User not found', EXCEPTION_TYPES.DATA_INVALID).bind('[getInfo]');
        }

        return {...user.dataValues, accessToken: currentUser.accessToken};
    });
};

const changeAvatar = (req, res) => {
    return DBHelper2.executeWithTransaction(async (transaction) => {
        const user = requestContext.get('request:user');
        const file = await uploadAvatar(req, res);
        const data = await User.findByPk(user.id, {
            include: [{model: File, as: 'avatar'}]
        });
        await data.setAvatar(file);
        await data.save({transaction});

        if (user.avatar) {
            await removeFiles([user.avatar.path]);
        }
        return data;
    });
};

const updateInfo = (body) => {
    return DBHelper2.executeWithTransaction(async (transaction) => {
        try {
            const currentUser = requestContext.get('request:user');
            const user = await User.findOne({where: {username: currentUser.username}});
            user.fullName = body.fullName;
            user.email = body.email;
            await user.save({transaction});
            return user;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind('register=>InsertUser');
        }
    });
};


module.exports = {login, getUsers, getInfo, register, changeAvatar, updateInfo};
