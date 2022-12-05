const express = require('express');
const router = express.Router();
const {EXCEPTION_TYPES, Exception} = require("@exception/custom-exception")
const requestContext = require("request-context")
const DBHelper = require("@utils/db-helper");
const {UserMapping} = require("@mapping/user-mapping");
const {make} = require('simple-body-validator');
const {getColumns, MatchMapping, PredictMapping} = require('@mapping/user-mapping');
const {getMatchById} = require('@service/matches');


const predictRules = {
    matchId: 'required',
    t1Score: 'required|integer|gt:0',
    t2Score: 'required|integer|gt:0',
}


const getPredictByMatchId = async (matchIds) => {
    return DBHelper.executeQuery(async connection => {
        try {
            let data = await connection.queryWithLog({
                sql: `SELECT ${getColumns(["id", "userId", "t1Score", "t2Score", "status"], PredictMapping)}
                      FROM predict.predicts
                      WHERE match_id = ?`,
                values: [matchIds]
            });
            const match = await getMatchById(matchIds);

            for (const p of data) {
                p.match = match;
                p.user = await connection.join({
                    table: "users",
                    joinColumn: "id",
                    columns: getColumns(["id", "username", "fullName", "avatar"], UserMapping),
                    joinValue: p.userId,
                    unique: true
                });
                delete p.matchId;
                delete p.userId;

            }
            return data;
        } catch (e) {
            console.log(e)
        }
    })
}


const createPredictByMatch = async (match) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        try {
            const validator = make(match, predictRules);
            if (!validator.stopOnFirstFailure().validate()) {
                throw new Error(validator.errors().first())
            }
            const user = requestContext.get('request:user');
            let data = await connection.queryWithLog({
                sql: `INSERT INTO predicts(match_id, user_id, t1_score, t2_score)
                          VALUE (?, ?, ?, ?)`,
                rowsAsArray: false,
                values: [match.matchId, user.userId, match.t1Score, match.t2Score]
            });
            return data.insertId;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind('predictByMatch=>InsertPredict');
        }
    })
}

const updatePredictByMatch = async (match) => {
    return DBHelper.executeQueryWithTransaction(async connection => {
        const validator = make(match, predictRules);
        if (!validator.stopOnFirstFailure().validate()) {
            throw new Exception(validator.errors().first(), EXCEPTION_TYPES.AUTH).bind('updatePredictByMatch=>Validate');
        }
        try {
            const user = requestContext.get('request:user');
            let data = await connection.queryWithLog({
                sql: `UPDATE predicts
                      set t1_score=?,
                          t2_score=?
                      WHERE match_id = ?
                        AND user_id = ?`,
                rowsAsArray: false,
                values: [match.t1Score, match.t2Score, match.matchId, user.userId]
            });
            return data;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.AUTH).bind('updatePredictByMatch=>InsertPredict');
        }
    })
}


module.exports = {getPredictByMatchId, createPredictByMatch, updatePredictByMatch}