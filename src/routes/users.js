const express = require('express');
const router = express.Router();
const {ROLE, authWithAsync} = require("@config/auth-middleware")
const {getInfo, changeAvatar, updateInfo} = require("@service/user-service")
const {getUsers} = require("@service/user-service")
const {ResponseBuilder} = require("@utils/ultil-helper")
const requestContext = require("request-context")

/**
 * @API: Get users
 * */
router.get('/', authWithAsync(async function (req, res, next) {
    const {page, limit, fields} = req.query;
    let data = await getUsers(page, limit, "", fields.split(","))
    res.send({data, msg: "get success"});
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


module.exports = router;
