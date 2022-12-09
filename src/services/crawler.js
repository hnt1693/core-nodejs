const {chromium} = require('playwright');
const logger = require('@utils/logger');

async function handleResponse(interceptedRequest) {
    if (interceptedRequest.url() && interceptedRequest.url().includes(BASE_URL)) {
        const {Stages} = await interceptedRequest.json();
        const wc = Stages.filter((o) => o.CompId === '54');
        const matches = [];
        wc.forEach((w) => {
            w.Events.filter((m) => m.Eps !== 'FT').forEach((match) => {
                matches.push({
                    time: match.Esd,
                    t1  : match.T1[0],
                    t2  : match.T1[0]
                });
            });
        });
        console.log(matches);
    }
}

const BASE_URL = 'https://prod-public-api.livescore.com/v1/api/app/date/soccer';


const fetch = async (url) => {
    logger.info('Start crawler ' + url);
    const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
    const page = await browser.newPage();
    page.on('response', handleResponse);
    await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
    await browser.close();
};

module.exports = {fetch};
