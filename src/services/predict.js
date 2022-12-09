const express = require('express');
const router = express.Router();
const {EXCEPTION_TYPES, Exception} = require("@exception/custom-exception")
const requestContext = require("request-context")
const DBHelper = require("@utils/db-helper");
const DBHelper2 = require("@utils/db-helper2");
const {Op} = require("sequelize");
const {Team} = require("@mapping/team.model");
const {UserMapping} = require("@mapping/user-mapping");
const {make} = require('simple-body-validator');
const {getColumns, MatchMapping, PredictMapping} = require('@mapping/user-mapping');
const {getMatchById} = require('@service/matches');
const {Predict} = require("@mapping/predict.model")
const {Match} = require("@mapping/match.model")
const {User} = require("@mapping/user-model")


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
    return DBHelper2.executeWithTransaction(async transaction => {
        try {
            const currentUser = requestContext.get('request:user');
            const [data] = await DBHelper2.sequelize.query(`INSERT INTO predict.predicts(team1Score, team2Score, user_id, match_id) VALUE (:team1, :team2, :userId, :matchId)`,
                {
                    replacements: {
                        team1: match.team1Score,
                        team2: match.team2Score,
                        userId: currentUser.id,
                        matchId: match.matchId
                    },
                })

            return await Predict.findByPk(data, {
                include: [
                    {
                        model: Match,
                        as: 'match',
                        include: [
                            {model: Team, as: "team1"},
                            {model: Team, as: "team2"},
                        ]
                    }
                ]
            })

        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind('predictByMatch=>InsertPredict');
        }
    })
}

const updatePredictByMatch = async (match) => {
    return DBHelper2.executeWithTransaction(async transaction => {
        try {
            const user = requestContext.get('request:user');
            const predict = await Predict.findOne({
                where: {
                    match_id: {
                        [Op.eq]: match.matchId
                    },
                    user_id: {
                        [Op.eq]: user.id
                    }
                },
                include: [
                    {
                        model: Match, as: 'match',
                        include: [
                            {model: Team, as: 'team1'},
                            {model: Team, as: 'team2'},
                        ]
                    },
                    {model: User, as: 'user', attributes: ['fullname', 'username', 'id']},
                ]
            })
            if (!predict) {
                throw new Error("Match not found")
            }
            if (predict.dataValues.match.status === "FT") {
                throw new Error("Match ended")
            }

            predict.team1Score = match.team1Score;
            predict.team2Score = match.team2Score;
            return await predict.save({transaction});
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.AUTH).bind('updatePredictByMatch=>InsertPredict');
        }
    })
}


module.exports = {getPredictByMatchId, createPredictByMatch, updatePredictByMatch}