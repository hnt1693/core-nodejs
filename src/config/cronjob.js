const CronjobBuilder = require("@utils/cronjob");
const {getMatchesForCronJob} = require("@service/matches")
const dayjs = require("dayjs")

const initial = function () {
    CronjobBuilder
        .getInstance()
        .regex("*/5 * * * * *", async () => {
            getMatchesForCronJob(dayjs().format("YYYYMMDD"));
            getMatchesForCronJob(dayjs().add(1,"day").format("YYYYMMDD"));
        })
}


module.exports = {initial}
