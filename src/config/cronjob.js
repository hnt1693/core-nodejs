const CronjobBuilder = require('@utils/cronjob');
const {getMatchesForCronJob} = require('@service/matches');
const dayjs = require('dayjs');
const logger = require('@utils/logger');

const initial = function() {
    CronjobBuilder.getInstance().regex('*/5 * * * * *', async () => {
        try {
            getMatchesForCronJob(dayjs().format('YYYYMMDD'));
            getMatchesForCronJob(dayjs().add(1, 'day').format('YYYYMMDD'));
        } catch (e) {
            logger.error(e.message);
        }
    });
};

module.exports = {initial};
