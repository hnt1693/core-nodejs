const express = require('express');
const router = express.Router();
const {authWithAsync} = require('@config/auth-middleware');
const {getMatches, getMatchById, getHistoryTeam} = require('@service/matches');
const {ResponseBuilder} = require('@utils/ultil-helper');

/**
 * @API: Get match by day Id
 * */
router.get('/:dayId', authWithAsync(async function(req, res, next) {
    const dayId = req.params.dayId;
    const data = await getMatches(parseInt(dayId));
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Get matches successfully')
        .build());
}, []));


router.get('/id/:id', authWithAsync(async function(req, res, next) {
    const id = req.params.id;
    const data = await getMatchById(parseInt(id));
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Get matches successfully')
        .build());
}, []));

router.get('/history/:teamId', authWithAsync(async function(req, res, next) {
    const id = req.params.teamId;
    const page = req.query.page;
    const limit = req.query.limit;
    const data = await getHistoryTeam(parseInt(id), parseInt(page), parseInt(limit));
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Get matches successfully')
        .build());
}, []));

module.exports = router;
