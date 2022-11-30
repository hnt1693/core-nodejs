var express = require('express');
var router = express.Router();
const {ROLE, authWithAsync} = require("@config/auth-middleware")
const {getUsers} = require("@service/user-service")
/* GET users listing. */
router.get('/', authWithAsync(async function (req, res, next) {
    const {page, limit, fields} = req.query;
    let data = await getUsers(page, limit, "", fields.split(","))
    res.send({data, msg: "get success"});
}, []));

module.exports = router;
