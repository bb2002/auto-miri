const puppeteer = require('puppeteer');
const { MIRI_ROOT } = require('./constant')

exports.init = async function() {
    const browser = await puppeteer.launch({
        headless: true,  //when PRODUCTION
        //headless: false, //when DEBUG
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 360,
        height: 740,
     })
    await page.goto(MIRI_ROOT, { waitUntil: "networkidle2" });

    return { browser, page };
}