const moment = require("moment");

exports.selectDate = async function(page) {
    const BUS_DATE = process.env.TARGET_BUS_DATE;
    const SEAT_PRIORITY = JSON.parse(process.env.SEAT_PRIORITY);

    await page.waitForNavigation();
    await page.click('#ui-container > div.reservation_pac > div.reserChk-body > div.boarding-date > a > dl');
    await page.waitForTimeout(500);

    // 예약 할 날짜 객체 생성
    const targetDate = moment().add(BUS_DATE, 'days');

    if (targetDate.month() !== moment().month()) {
        // 다음달로 이동시킬 필요가 있음
        await page.click('#calCtrl > div > span.cal_btn.cal_btn_right > button');
        await page.waitForTimeout(500);
    }

    const reserveDateItems = await page.$$('a');
    let isDateSelected = false;
    for (const rd of reserveDateItems) {
        const label = await page.evaluate(el => el.innerText, rd);
        
        if (label === targetDate.format('DD')) {
            // 해당 날짜 선택
            await page.evaluate((date) => {
                selectDay(date); // 날짜 선택
                saveCalendar(); // 날짜 저장
                goSeatSelecter(); // 좌석선택
                closeHtmlMove('msgHtml','Javascript:goReservation();') // 경고창 닫기
            }, Number(targetDate.format('YYYYMMDD')))

            isDateSelected = true;
            break;
        }
    }

    if (!isDateSelected) {
        throw new Error(`${targetDate.format('YYYY-MM-DD')} 는 예약 할 수 없는 날짜입니다.`);
    }


    // 좌석 선택
    const seatItems = await page.$$('.btn-seat');
    let reserved = false;
    let reservedSeatIdx = -1;

    for (const seatIdx of SEAT_PRIORITY) {
        // 해당 seatIdx 가 앉을 수 있는지 확인

        for (const seat of seatItems) {
            const label = await page.evaluate(el => el.innerText, seat);
            if (label === `${seatIdx}`) {
                const className = await page.evaluate(el => el.className, seat);
                console.log(label, className);

                if (className.indexOf('yourseat') === -1) {
                    // 해당 seatIdx 에 앉을 수 있음
                    reservedSeatIdx = seatIdx;
                    reserved = true;

                    await page.evaluate((seatIdx) => {
                        clickSeatValue(seatIdx - 1);
                        saveSeatCtrl();
                    }, seatIdx)
                    break;
                }
            }
        }

        if (reserved) {
            break;
        }
    }

    await page.waitForTimeout(1000);
    return reservedSeatIdx;
}