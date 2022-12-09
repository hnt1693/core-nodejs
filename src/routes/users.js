const express = require('express');
const router = express.Router();
const {ROLE, authWithAsync} = require('@config/auth-middleware');
const {fetch} = require('@service/crawler');
const {getInfo, changeAvatar, updateInfo} = require('@service/user-service');
const {getUsers} = require('@service/user-service');
const {ResponseBuilder} = require('@utils/ultil-helper');
const requestContext = require('request-context');
const {User} = require('@mapping/user-model');
const {File} = require('@mapping/file-model');
const DbHelper = require('@utils/db-helper2');

/**
 * @API: Get users
 * */
router.get('/', authWithAsync(async function(req, res, next) {
    const {page, limit, fields} = req.query;
    const data = await getUsers(page, limit, '', (fields || '').split(','));
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg('Get users successfully')
        .build()
    );
}, []));

router.get('/test', authWithAsync(async function(req, res, next) {
    return DbHelper.executeWithTransaction(async (tran) => {
        await User.sync({force: true});
        await File.sync({force: true});
        res.send({data: await User.findAll({include: File}), msg: 'get success'});
    });
}, []));

/**
 * @API: Get profile
 * */
router.get('/info', authWithAsync(async function(req, res, next) {
    const user = requestContext.get('request:user');
    const data = await getInfo(user);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg('Get info success')
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));


router.post('/change-avatar', authWithAsync(async function(req, res, next) {
    const data = await changeAvatar(req, res);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg('Change avatar success ')
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));


router.put('/update', authWithAsync(async function(req, res, next) {
    const data = await updateInfo(req.body);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg('Update profile success')
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));

router.put('/wc', authWithAsync(async function(req, res, next) {
    await fetch('https://www.livescore.com/en/');
    res.json(ResponseBuilder.getInstance()
        .data('Ok')
        .code(200)
        .msg('Update profile success')
        .build()
    );
}, []));


module.exports = router;
