
var express = require('express');
var router = express.Router();
const UserService = require("@service/user-service")
const contextService = require('request-context');
const {authWithAsync, ROLE} = require('@config/auth-middleware')
const {getRequestParams} = require("@utils/ultil-helper")
const {encode} = require("@service/jwt")


// routes/users.js

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users.
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The user ID.
 *                         example: 0
 *                       name:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 */
router.get('/', authWithAsync(async function (req, res, next) {
    const {limit, page, name, fields} = getRequestParams(req);
    const [data] = await UserService.getUsers(parseInt(page), parseInt(limit), name, fields.split(","));
    res.send({data, "code": 200});
}, []));

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
    res.send({data, "code": 200, msg: "Register successfully!"})
}, []))


/**
 * @Target: Get profile
 */
router.get("/info", authWithAsync(async (req, res, next) => {
    let user = contextService.get('request:user');
    const data = await UserService.getInfo(user.username);
    res.send({data, "code": 200})
}, [ROLE.IS_AUTHENTICATED]))


module.exports = router;
