const axios = require("axios")
const DbHelper = require("@utils/db-helper")
const DbHelper2 = require("@utils/db-helper2")
const {StringBuilder} = require("@utils/ultil-helper");
const dayjs = require("dayjs");
const {getColumns, MatchMapping, TeamMapping} = require("@mapping/user-mapping");
const logger = require("@utils/logger");
const {User} = require("@mapping/user-model");
const {sequelize} = require("@utils/db-helper2");
const {Predict} = require("@mapping/predict.model");
const {Match} = require("@mapping/match.model");
const {Op} = require("sequelize");
const {Team} = require("@mapping/team.model");
const {Exception, EXCEPTION_TYPES} = require("@exception/custom-exception");
let lastMatches;


const getMatchesForCronJob = async (dayID) => {
    try {
        DbHelper2.executeWithTransaction(async (transaction) => {
                const matches = await getMatches(dayID);
                const matchesIds = [];
                matches.forEach(m => {
                    matchesIds.push(parseInt(m.id));
                })

                if (matchesIds.length === 0) return;

                const existMatchIds = await Match.findAll({
                    where: {
                        id: {
                            [Op.in]: matchesIds
                        }
                    },
                    logging: false
                })


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
                await insertMatches(matchesNew, transaction);

                //CHECK UPDATE NEW
                // const matchesTime = addUnactivatedTimes(matches);
                // const currentTime = dayjs().format("YYYYMMDDHHmmss");
                // let isNeedToRun = false;
                //
                // for (const time of matchesTime) {
                //     if (time.startTime <= currentTime - 1000 && time.end >= currentTime) {
                //         isNeedToRun = true;
                //         break;
                //     }
                // }

                if (true) {
                    await updateMatches(matchesUpdate, transaction);
                }
                lastMatches = matches;
            }, false
        )

    } catch (e) {
        throw e
    }
}

const updateMatches = async (matches, connection) => {
    if (matches.length === 0) return;

    const ids = [];
    matches.forEach(m => ids.push(parseInt(m.id)))

    const matchInDB = await Match.findAll({
        where: {
            id: {
                [Op.in]: ids
            }
        },
        logging: false
    })

    matches = getMatchNeedToUpdate(matches)

    for (let m of matchInDB) {
        const find = matches.find(t => t.id === m.id);
        if (find) {
            m.status = find.status;
            m.team1Score = find.team1Score;
            m.team2Score = find.team2Score;
            await m.save();
        }
    }


}

const insertMatches = async (matches, transaction) => {
    lastMatches = matches;
    if (matches.length === 0) return;

    for (const m of matches) {

        const [team1, created1] = await Team.findOrCreate({
            where: {
                id: m.team1.id
            },
            defaults: {
                ...m.team1
            }
        })
        const [team2, created2] = await Team.findOrCreate({
            where: {
                id: m.team2.id
            },
            defaults: {
                ...m.team2
            }
        })
        const match = await Match.create({
            id: m.id,
            league: m.league,
            org: m.org,
            status: m.status,
            team1Score: m.team1Score,
            team2Score: m.team2Score,
            time: m.time,
        })
        if (created1) {
            await match.setTeam1(team1)
        }
        if (created2) {
            await match.setTeam2(team2)
        }
        await match.save({transaction})
    }
}

function getMatchNeedToUpdate(matches) {
    const temp = [];
    matches.forEach(m => {
        const find = lastMatches.find(t => t.id === m.id)
        if (find && find.team1Score != m.team1Score && find.team2Score != m.team2Score) {
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
        let wc = Stages.filter(o => o.CompId == '54' || o.CompId==108)
        const matches = []
        const matchesIds = [];
        const teamIds = [];
        wc.forEach(w => {
            w.Events.forEach(match => {
                matchesIds.push(match.Eid);
                teamIds.push(match.T1[0].ID);
                teamIds.push(match.T2[0].ID);
                matches.push({
                    id: match.Eid,
                    org: w.Csnm,
                    league: w.Snm,
                    time: match.Esd,
                    team1: {
                        id: match.T1[0].ID,
                        name: match.T1[0].Nm,
                        shortName: match.T1[0].Abr,
                        img: `${BASE_IMG_URL}${match.T1[0].Img}`
                    },
                    team2: {
                        id: match.T2[0].ID,
                        name: match.T2[0].Nm,
                        shortName: match.T2[0].Abr,
                        img: `${BASE_IMG_URL}${match.T2[0].Img}`
                    },
                    team1Score: match.Tr1,
                    team2Score: match.Tr2,
                    status: match.Eps
                })
            })
        })
        return matches;
    } catch (e) {
        throw new Exception(e.message, EXCEPTION_TYPES.DATA_INVALID).bind("[GetMatches]")
    }

}

const getMatchById = async (id) => {
    return DbHelper2.execute(async () => {
        return await Match.findByPk(id, {
            include: [
                {model: Team, as: 'team1'},
                {model: Team, as: 'team2'},
                {
                    model: Predict,
                    as: 'predicts',
                    on: {
                        match_id: {[Op.eq]: sequelize.col('matches.id')}
                    },

                    include: [
                        {
                            model: User,
                            as: 'user'
                        }
                    ]
                }
            ]
        });
    })
}

const getHistoryTeam = async (teamId, page = 0, limit = 10) => {
    return DbHelper2.execute(async () => {
        const countAll = await Match.count({
            where: {
                [Op.or]: [
                    {team1_id: teamId},
                    {team2_id: teamId},
                ]
            }
        })
        const matches = await Match.findAndCountAll({
            where: {
                [Op.or]: [
                    {team1_id: teamId},
                    {team2_id: teamId},
                ]
            },
            order: [
                ['time', 'DESC']
            ],
            include: [
                {association: 'team1'},
                {association: 'team2'},
            ],
            limit,
            offset: page * limit
        })
        return matches;
    })
}

module.exports = {getMatches, getMatchesForCronJob, getMatchById, getHistoryTeam}
