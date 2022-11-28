var express = require('express');
var router = express.Router();
const UserService = require("../services/user-service")
const {authWithAsync, ROLE} = require("../config/auth-middleware")
const {handleErrorAsync} = require("../config/error-handler")
const {getRequestParams} = require("../utils/ultil-helper")
const {hashPassword, verifyPasswordWithHash} = require("../utils/password-encrypt")
const {encode} = require("../services/jwt")
/**
 * @Target: Get List
 */
router.get('/', authWithAsync(async function (req, res, next) {
    const {limit, page, name, fields} = getRequestParams(req);
    const [data] = await UserService.getUsers(parseInt(page), parseInt(limit), name, fields.split(","));
    res.send({data, "code": 200});
}, [ROLE.ADMIN]));

/**
 * @Target: Login
 */
router.post("/", authWithAsync(async (req, res, next) => {
    const data = await UserService.login(req.body);
    res.cookie('SSID', encode(data));
    res.send({data, "code": 200})
}, []))


/**
 * @Target: Register
 */
router.post("/register", authWithAsync(async (req, res, next) => {
    const data = await UserService.register(req.body);
    res.send({data, "code": 200})
}, []))


/**
 * @Target: Get profile
 */
router.get("/info", authWithAsync(async (req, res, next) => {
    let user = res.locals.user;
    const data = await UserService.getInfo(user.user_name);
    res.send({data, "code": 200})
}, [ROLE.IS_AUTHENTICATED]))


module.exports = router;
