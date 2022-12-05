const axios = require("axios")
const DbHelper = require("@utils/db-helper")
const {StringBuilder} = require("@utils/ultil-helper");
const dayjs = require("dayjs");
const logger = require("@utils/logger");
const {Exception, EXCEPTION_TYPES} = require("@exception/custom-exception");
let lastMatches;

const getMatchesForCronJob = async (dayID) => {
    try {
        DbHelper.executeQueryWithTransaction(async connection => {
            const matches = await getMatches(dayID);
            const matchesIds = [];
            matches.forEach(m => {
                matchesIds.push(m.id);
            })

            if (matchesIds.length === 0) return;

            const [existMatchIds] = await connection.query(`SELECT id
                                                       FROM matches
                                                       where id in (${matchesIds.join(", ")})`);
            let matchesUpdate = [];
            let matchesNew = [];

            if (existMatchIds.length === 0) {
                matchesUpdate = [];
                matchesNew = [...matches];
            } else {
                matches.forEach(m => {
                    if (existMatchIds.find(t => t.id == m.id)) {
                        matchesUpdate.push(m)
                    } else {
                        matchesNew.push(m)
                    }
                })
            }

            //INSERT NEW
            insertMatches(matchesNew, connection);

            //CHECK UPDATE NEW
            const matchesTime = addUnactivatedTimes(matches);
            const currentTime = dayjs().format("YYYYMMDDHHmmss");
            let isNeedToRun = false;

            for (const time of matchesTime) {
                if (time.startTime <= currentTime - 1000 && time.end >= currentTime) {
                    isNeedToRun = true;
                    break;
                }
            }
            if (isNeedToRun) {
                updateMatches(matchesUpdate, connection);
            }
        })

    } catch (e) {
        throw e
    }
}

const updateMatches = async (matches, connection) => {
    if (matches.length === 0) return;

    let sqlMatch = new StringBuilder();
    let matchValues = [];
    const teamMTemp = new Map();
    sqlMatch.append(" UPDATE matches set status=? ,t1_score=?, t2_score=? WHERE id=?")

    matches = getMatchNeedToUpdate(matches);
    matches.forEach(m => {
        connection.query({
            sql: `${sqlMatch.value}`,
            values: [m.result.status, m.result.t1Score, m.result.t2Score, m.id]
        });
    })
}

const insertMatches = async (matches, connection) => {
    lastMatches = matches;
    if (matches.length === 0) return;

    let sqlMatch = new StringBuilder();
    let sqlTeams = new StringBuilder();
    let tempSqlBuilder = new StringBuilder();
    let matchValues = [];
    let teamValues = [];
    let teamIds = [];
    const teamMTemp = new Map();
    sqlMatch.append(" INSERT INTO matches(id, org, league, time, t1, t2, status, t1_score, t2_score,day_id) VALUES ")
    sqlTeams.append("INSERT INTO teams(id, name, img, short_name) VALUES ");

    matches.forEach(m => {
        matchValues.push(`(${m.id},'${m.org}','${m.league}',${m.time},${m.t1.id},${m.t2.id},${m.result?.status ? "'" + m.result.status.replace("'", "m") + "'" : null},${m.result?.t1Score || null},${m.result?.t2Score || null},${dayjs(m.time + '', 'YYYYMMDDHHmmss').format("YYYYMMDD")})`);

        tempSqlBuilder = new StringBuilder();
        tempSqlBuilder.append(`(${m.t1.id},`);
        tempSqlBuilder.append(`'${m.t1.name}',`);
        tempSqlBuilder.append(`'${m.t1.img}',`);
        tempSqlBuilder.append(`'${m.t1.shortName}')`);
        teamMTemp.set(m.t1.id, tempSqlBuilder.value)
        teamIds.push(m.t1.id)

        tempSqlBuilder = new StringBuilder();
        tempSqlBuilder.append(`(${m.t2.id},`);
        tempSqlBuilder.append(`'${m.t2.name}',`);
        tempSqlBuilder.append(`'${m.t2.img}',`);
        tempSqlBuilder.append(`'${m.t2.shortName}')`);
        teamMTemp.set(m.t2.id, tempSqlBuilder.value)
        teamIds.push(m.t2.id)
    })
    sqlMatch.append(`${matchValues.join(", ")}`);
    connection.query({sql: sqlMatch.value, values: []});

    let teamExist = await connection.queryWithLog({
        sql: `SELECT id FROM teams WHERE id in (${teamIds.join(",")})`,
        values: []
    });
    const teamWillAdd = [];
    teamMTemp.forEach((v, k) => {
        if (!teamExist.find(t => t.id === k)) {
            teamWillAdd.push(v)
        }
    })
    if (teamWillAdd.length > 0) {
        sqlTeams.append(teamWillAdd.join(", "));
        await connection.query({sql: sqlTeams.value, values: []});
    }
}

function getMatchNeedToUpdate(matches) {
    const temp = [];
    matches.forEach(m => {
        const find = lastMatches.find(t => t.id === m.id)
        if (find && find.result.toString() !== m.result.toString()) {
            temp.push(m);
        }
    })
    return temp;
}

function addUnactivatedTimes(matches) {
    const matchingTime = [];

    matches.forEach(m => {
        const startTime = dayjs(m.time + "", "YYYYMMDDHHmmss");
        if (m.time >= dayjs().format("YYYYMMDD000000") && m.time <= dayjs().format("YYYYMMDD240000")) {
            matchingTime.push({start: m.time, end: parseInt(startTime.add(150, "minute").format("YYYYMMDDHHmmss"))})
        }
    })
    return matchingTime;
}


const getMatches = async (dayId) => {
    try {
        let {Stages} = (await axios.get(`https://prod-public-api.livescore.com/v1/api/app/date/soccer/${dayId}/7?MD=1`)).data
        const BASE_IMG_URL = 'https://lsm-static-prod.livescore.com/medium/'
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
                    t1: {
                        id: match.T1[0].ID,
                        name: match.T1[0].Nm,
                        shortName: match.T1[0].Abr,
                        Img: `${BASE_IMG_URL}${match.T1[0].Img}`
                    },
                    t2: {
                        id: match.T2[0].ID,
                        name: match.T2[0].Nm,
                        shortName: match.T2[0].Abr,
                        Img: `${BASE_IMG_URL}${match.T2[0].Img}`
                    },
                    result
                })
            })
        })
        return matches;
    } catch (e) {
        console.log(e)
        throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind("[GetMatches]")
    }

}

module.exports = {getMatches, getMatchesForCronJob}
