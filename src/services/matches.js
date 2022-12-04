const axios = require("axios")
const DbHelper = require("@utils/db-helper")
const {StringBuilder} = require("@utils/ultil-helper");
const logger = require("@utils/logger");


const getMatches = async (dayID) => {
    try {
        DbHelper.executeQueryWithTransaction(async connection => {
            let {Stages} = (await axios.get(`https://prod-public-api.livescore.com/v1/api/app/date/soccer/${dayID}/7?MD=1`)).data
            let wc = Stages.filter(o => o.CompId === '54')
            const matches = []
            const matchesIds = [];
            const teamIds = [];
            wc.forEach(w => {
                w.Events.forEach(match => {
                    matchesIds.push(match.Eid);
                    teamIds.push(match.T1[0].ID);
                    teamIds.push(match.T2[0].ID);
                    let result = {};
                    if (match.Tr1 && match.Tr2) {
                        result = {
                            t1Score: match.Tr1,
                            t2Score: match.Tr2,
                            status: match.Eps
                        }
                    }
                    matches.push({
                        id: match.Eid,
                        org: w.Csnm,
                        league: w.Snm,
                        time: match.Esd,
                        t1: match.T1[0],
                        t2: match.T2[0],
                        result
                    })
                })
            })

            if (matchesIds.length === 0) return;
            const [existMatchIds] = await connection.query(`SELECT id
                                                       FROM matches
                                                       where id in (${matchesIds.join(", ")})`);
            let matchesUpdate;
            let matchesNew;
            if (existMatchIds.length === 0) {
                matchesUpdate = [...matches];
                matchesNew = [];
            } else {
                matchesUpdate = matchesIds.filter(m => existMatchIds.find(t => t.id === m.id));
                matchesNew = matchesIds.filter(m => existMatchIds.find(t => t.id !== m.id));
            }
            insertMatches(matchesNew);
            updateMatches(matchesUpdate);


            // let sqlMatch = new StringBuilder();
            // let sqlTeams = new StringBuilder();
            // let tempSqlBuilder = new StringBuilder();
            // const teamMTemp = new Map();
            // const teamIds = [];
            // sqlMatch.append("insert into matches(id, org, league, time, t1, t2, status, t1_score, t2_score) VALUES ");
            // sqlTeams.append("INSERT INTO teams(id, name, img, short_name) VALUES ");
            //
            // for (const m of matches) {
            //     tempSqlBuilder = new StringBuilder();
            //     tempSqlBuilder.append(`(${m.t1.ID},`);
            //     tempSqlBuilder.append(`'${m.t1.Nm}',`);
            //     tempSqlBuilder.append(`'${m.t1.Img}',`);
            //     tempSqlBuilder.append(`'${m.t1.Abr}')`);
            //     teamMTemp.set(m.t1.ID, tempSqlBuilder.value)
            //     teamIds.push(m.t1.ID)
            //
            //     tempSqlBuilder = new StringBuilder();
            //     tempSqlBuilder.append(`(${m.t2.ID},`);
            //     tempSqlBuilder.append(`'${m.t2.Nm}',`);
            //     tempSqlBuilder.append(`'${m.t2.Img}',`);
            //     tempSqlBuilder.append(`'${m.t2.Abr}')`);
            //     teamMTemp.set(m.t2.ID, tempSqlBuilder.value)
            //     teamIds.push(m.t2.ID)
            //
            //
            //     sqlMatch.append("(");
            //     sqlMatch.append(`${m.id},`);
            //     sqlMatch.append(`'${m.org}',`);
            //     sqlMatch.append(`'${m.league}',`);
            //     sqlMatch.append(`${m.time},`);
            //     sqlMatch.append(`${m.t1.ID},`)
            //     sqlMatch.append(`${m.t2.ID},`)
            //     sqlMatch.append(`${m.result?.status ? "'" + m.result.status.replace("'", "m") + "'" : null},`)
            //     sqlMatch.append(`${m.result?.t1Score || null},`)
            //     sqlMatch.append(`${m.result?.t2Score || null}),`)
            //
            // }
            //
            // let sql = sqlMatch.value;
            // sql = sql.substr(0, sql.length - 1);
            // let data = await connection.queryWithLog({sql: sql, values: []});
            //
            //
            // let teamExist = await connection.queryWithLog({
            //     sql: `SELECT id FROM teams WHERE id in (${teamIds.join(",")})`,
            //     values: []
            // });
            //
            // const teamWillAdd = [];
            // teamMTemp.forEach((v, k) => {
            //     if (!teamExist.find(t => t.id == k)) {
            //         teamWillAdd.push(v)
            //     }
            // })
            // if (teamWillAdd.length > 0) {
            //     sqlTeams.append(teamWillAdd.join(", "));
            //     await connection.queryWithLog({sql: sqlTeams.value, values: []});
            // }
        })


    } catch (e) {
        throw e
    }
}

const updateMatches = (matches, connection) => {
    if (matches.length === 0) return
}

const insertMatches = (matches, connection) => {
    if (matches.length === 0) return
}

module.exports = {getMatches}
