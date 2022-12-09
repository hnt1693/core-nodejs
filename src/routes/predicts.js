const express = require('express');
const router = express.Router();
const {ROLE, authWithAsync} = require('@config/auth-middleware');
const {updatePredictByMatch, createPredictByMatch, getPredictByMatchId} = require('@service/predict');
const {ResponseBuilder} = require('@utils/ultil-helper');

/**
 * @API: Create predict
 * */
router.get('/:id', authWithAsync(async function(req, res, next) {
    const data = await getPredictByMatchId(req.params.id);
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Create predict successfully')
        .build());
}, [ROLE.IS_AUTHENTICATED]));

/**
 * @API: Create predict
 * */
router.post('/', authWithAsync(async function(req, res, next) {
    const data = await createPredictByMatch(req.body);
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Create predict successfully')
        .build());
}, [ROLE.IS_AUTHENTICATED]));


/**
 * @API: Update predict
 * */
router.put('/', authWithAsync(async function(req, res, next) {
    const data = await updatePredictByMatch(req.body);
    res.send(ResponseBuilder.getInstance()
        .code(200)
        .data(data)
        .msg('Create predict successfully')
        .build());
}, [ROLE.IS_AUTHENTICATED]));


module.exports = router;
