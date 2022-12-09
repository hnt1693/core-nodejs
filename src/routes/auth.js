var express = require('express');
var router = express.Router();
const UserService = require("@service/user-service")
const contextService = require('request-context');
const {authWithAsync, ROLE} = require('@config/auth-middleware')
const {getRequestParams, ResponseBuilder} = require("@utils/ultil-helper")
const {encode} = require("@service/jwt")

/**
 * @API :  Get Users
 */
/
router.get('/', authWithAsync(async function (req, res, next) {
    const {limit, page, name, fields} = getRequestParams(req);
    const [data] = await UserService.getUsers(parseInt(page), parseInt(limit), name, fields.split(","));
    res.send({data, "code": 200});
}, []));

/**
 * @API :  Login
 */
router.post("/", authWithAsync(async (req, res, next) => {
    const data = await UserService.login(req.body);
    res.send(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Login successfully")
        .build())
}, []))


/**
 * @API :  Register
 */
router.post("/register", authWithAsync(async (req, res, next) => {
    const data = await UserService.register(req.body);
    res.send(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Register successfully!")
        .build())
}, []))


/**
 * @Target: Get profile
 */
router.get("/info", authWithAsync(async (req, res, next) => {
    let user = contextService.get('request:user');
    const data = await UserService.getInfo(user.username);
    res.send(ResponseBuilder.getInstance()
        .data(data)
        .code(200)
        .msg("Get info successfully!")
        .build())
}, [ROLE.IS_AUTHENTICATED]))


module.exports = router;
