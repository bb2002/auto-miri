const { MIRI_RESERVATION } = require("./constant");

exports.checkReserve = async function(page, targetDate) {
    await page.goto(MIRI_RESERVATION, { waitUntil: "networkidle2" });

    {
        // 예약 날짜 확인
        const reserveItems = await page.$$('.reser_check_unit');

        for (const reserve of reserveItems) {
            const label = await page.evaluate(el => el.innerText, reserve);
            if (label.indexOf(`${targetDate.format('YYYY.MM.DD')}`) !== -1) {
                await reserve.click()
                break;
            }
        }
    }

    await page.waitForNavigation();

    {
        // 화면 캡쳐
        await page.screenshot({
            type: 'png',
            path: `reserve_${targetDate.format('YYYYMMDD')}.png`,
            clip: {
                x: 0,
                y: 0,
                width: 360,
                height: 740,
            }
        })
    }

    return `reserve_${targetDate.format('YYYYMMDD')}.png`
}