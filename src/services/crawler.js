const {chromium, firefox, webkit} = require('playwright');
const logger = require("@utils/logger")

async function handleResponse(interceptedRequest) {
    if (interceptedRequest.url() && interceptedRequest.url().includes(BASE_URL)) {
        let {Stages} = await interceptedRequest.json();
        const wc = Stages.filter(o => o.CompId === '54')
        console.log(wc)
    }
}

const BASE_URL = "https://prod-public-api.livescore.com/v1/api/app/date/soccer"


const fetch = async (url) => {
    logger.info("Start crawler " + url)
    const browser = await webkit.launch();  // Or 'firefox' or 'webkit'.
    const page = await browser.newPage();
    page.on('response', handleResponse);
    await page.goto(url, {waitUntil: "networkidle", timeout: 60000});
    await browser.close();
}

module.exports = {fetch}