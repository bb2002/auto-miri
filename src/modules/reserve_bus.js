const { MIRI_ROOT } = require("./constant");

exports.reserveBus = async function(page) {
    const BUS_NUM = process.env.TARGET_BUS_NUM;
    const BUS_TIME = process.env.TARGET_BUS_TIME;
    const START_STAT_ID = process.env.TARGET_START_STAT_ID;
    const ARRIV_STAT_ID = process.env.TARGET_ARRIV_STAT_ID;

    // 예약 페이지로 이동
    await page.goto(MIRI_ROOT, { waitUntil: "networkidle2" });

    {
        // 경고창이 뜨는 경우 닫기
        try {
            await page.click('#closePop4');
        } catch(ex) {}
    }

    {
        // 버스 번호와 시간대 선택
        await page.click('#ui-container > div.bx-wrapper > div.bx-viewport > div > div:nth-child(1) > ul > li:nth-child(1) > a')
        await page.waitForTimeout(500);

        const busItems = await page.$$('.pop_list_unit');
        let isBusSelected = false;
        for (const bus of busItems) {
            const label = await page.evaluate(el => el.innerText, bus);
            if (label.indexOf(BUS_NUM) !== -1 && label.indexOf(BUS_TIME) !== -1) {
                await bus.click();
                isBusSelected = true;
                break;
            }
        }

        if (!isBusSelected) {
            // 버스를 선택하지 못한 경우
            throw new Error('버스를 선택하지 못했습니다.');
        }

        // 확인 버튼 클릭
        await page.click('#pop_line > div > div.btns-footer > a');
    }

    await page.waitForTimeout(500);

    {
        // 버스 출발 정거장 선택
        await page.click('#ui-container > div.bx-wrapper > div.bx-viewport > div > div:nth-child(1) > ul > li:nth-child(2) > a');
        await page.waitForTimeout(500);

        const startStats = await page.$$('.pop_list_unit');
        let isStartStatSelected = false;
        for (const stat of startStats) {
            const label = await page.evaluate(el => el.innerText, stat);
            if (label.indexOf(START_STAT_ID) !== -1) {
                await stat.click();
                isStartStatSelected = true;
                break;
            }
        }

        if (!isStartStatSelected) {
            // 정거장을 선택하지 못한 경우
            throw new Error('출발 정거장을 선택하지 못했습니다.');
        }

        // 확인 버튼 클릭
        await page.click('#pop_linestop > div > div.btns-footer.stop-footer > a');
    }

    await page.waitForTimeout(500);

    {
        // 버스 도착 정거장 선택
        await page.click('#ui-container > div.bx-wrapper > div.bx-viewport > div > div:nth-child(1) > ul > li:nth-child(3) > a');
        await page.waitForTimeout(500);

        const stopStats = await page.$$('.pop_list_unit');
        let isStopStatSelected = false;
        for (const stat of stopStats) {
            const label = await page.evaluate(el => el.innerText, stat);
            if (label.indexOf(ARRIV_STAT_ID) !== -1) {
                await stat.click();
                isStopStatSelected = true;
                break;
            }
        }

        if (!isStopStatSelected) {
            // 정거장을 선택하지 못한 경우
            throw new Error('도착 정거장을 선택하지 못했습니다.');
        }

        // 확인 버튼 클릭
        await page.click('#pop_linestop > div > div.btns-footer.stop-footer > a');
    }

    await page.waitForTimeout(500);
    await page.click('#ui-container > div.bx-wrapper > div.bx-viewport > div > div:nth-child(1) > div.btns-footer > a', { waitUntil: 'networkidle2' });
}