const express = require('express');
const router = express.Router();
const {ROLE, authWithAsync} = require("@config/auth-middleware")
const {fetch} = require("@service/crawler")
const {getInfo, changeAvatar, updateInfo} = require("@service/user-service")
const {getUsers} = require("@service/user-service")
const {ResponseBuilder} = require("@utils/ultil-helper")
const requestContext = require("request-context")
const {User} = require("@mapping/user-model")

/**
 * @API: Get users
 * */
router.get('/', authWithAsync(async function (req, res, next) {
    const {page, limit, fields} = req.query;
    let data = await getUsers(page, limit, "", fields.split(","))
    res.send({data, msg: "get success"});
}, []));


router.get('/test', authWithAsync(async function (req, res, next) {
    await User.sync()
    let x = await User.create({ userName:"123132123",password:"123123321123","email": 'hello1232'});
    await x.save();
    res.send({msg: "get success"});
}, []));


/**
 * @API: Get profile
 * */
router.get('/info', authWithAsync(async function (req, res, next) {
    let user = requestContext.get('request:user')
    let data = await getInfo(user.username);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Get info success")
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));


router.post('/change-avatar', authWithAsync(async function (req, res, next) {
    let data = await changeAvatar(req, res);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Change avatar success ")
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));


router.put('/update', authWithAsync(async function (req, res, next) {
    let data = await updateInfo(req.body);
    res.json(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Update profile success")
        .build()
    );
}, [ROLE.IS_AUTHENTICATED]));

router.put('/wc', authWithAsync(async function (req, res, next) {
    let data = fetch('https://www.livescore.com/en/')
    res.json(ResponseBuilder.getInstance()
        .data("Ok")
        .code(200)
        .msg("Update profile success")
        .build()
    );
}, []));


module.exports = router;
