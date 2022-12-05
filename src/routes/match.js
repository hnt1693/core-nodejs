const express = require('express');
const router = express.Router();
const {ROLE, authWithAsync} = require("@config/auth-middleware")
const {getMatches} = require("@service/matches")
const {ResponseBuilder} = require("@utils/ultil-helper")
const requestContext = require("request-context")

/**
 * @API: Get match by day Id
 * */
router.get('/:dayId', authWithAsync(async function (req, res, next) {
    const dayId = req.params.dayId;
    let data = await getMatches(parseInt(dayId))
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg("Get matches successfully")
        .build());
}, []));


module.exports = router;
