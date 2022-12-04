const CronjobBuilder = require("@utils/cronjob");
const {getMatches} = require("@service/matches")
const dayjs = require("dayjs")

const initial = function () {
    CronjobBuilder
        .getInstance()
        .regex("*/1 * * * * *", async () => {
            getMatches(dayjs().format("YYYYMMDD"))
        })
}


module.exports = {initial}
