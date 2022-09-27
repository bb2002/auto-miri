const { checkReset } = require("./modules/check_rest");
const { init } = require("./modules/init")
const { miriLogin } = require('./modules/miri_login');
const { reserveBus } = require("./modules/reserve_bus");
const { selectDate } = require("./modules/select_date");
const { checkReserve } = require("./modules/check_reserve");
const { close } = require("./modules/close");
const moment = require("moment");
const path = require('path');
const { initDiscord, sendMessage } = require("./modules/send_discord");
require('dotenv').config();

let outerBrowser = null;

async function bootstrap() {
    // const delayPromise = new Promise((resolve, reject) => {
    //     const time = Math.floor(process.env.START_UP_DELAY * Math.random() * 1000);

    //     setTimeout(() => {
    //         resolve()
    //     }, time);
    // });
    //await delayPromise;

    // discord 초기화
    await initDiscord();

    const BUS_DATE = process.env.TARGET_BUS_DATE;
    const targetDate = moment().add(BUS_DATE, 'days');

    // 예약할 날짜가 휴일/공휴일인지 확인
    try {
        const output = await checkReset();
        if (output.rest) {
            await sendMessage(`${targetDate.format('YYYY년 MM월 DD일')}은 ${output.reason}이므로, 예약을 하지 않았어요.`);
            return;
        }
    } catch (ex) {
        await sendMessage('공휴일 확인에 문제가 있었습니다. 무시하고 진행합니다.');
        console.error(ex);
    }
    
    const { browser, page } = await init();
    outerBrowser = browser;

    // 로그인
    try {
        await miriLogin(page);
    } catch (ex) {
        await sendMessage(`${targetDate.format('YYYY-MM-DD')} 예약 오류 -> MIRI 로그인에 실패했습니다.`);
        console.error(ex);
        return;
    }

    // 버스 예약
    try {
        await reserveBus(page);
    } catch (ex) {
        await sendMessage(`${targetDate.format('YYYY-MM-DD')} 예약 오류 -> 버스 및 정거장 선택에 실패했습니다.`);
        console.error(ex);
        return;
    }

    // 날짜 및 자리 선택
    let rsIdx = -1;
    try {
        rsIdx = await selectDate(page);
    } catch(ex) {
        await sendMessage(`${targetDate.format('YYYY-MM-DD')} 예약 오류 -> 날짜 및 자리 선택에 실패했습니다.`);
        console.error(ex);
        return;
    }

    let resultFilePath = null;
    try {
        const filename = await checkReserve(page, targetDate);
        resultFilePath = path.join(__dirname, '../', filename);
    } catch(ex) {
        await sendMessage(`${targetDate.format('YYYY-MM-DD')} 확인 오류 -> ${rsIdx} 자리 예약 여부를 확인 할 수 없습니다.`);
        console.error(ex);
        return;
    }

    await sendMessage(`${targetDate.format('YYYY-MM-DD')} 예약 완료~! ${rsIdx}번 자리를 예약했습니다.`, resultFilePath);
}

bootstrap().then(async () => {
    // 프로그램이 성공적으로 종료 됨
    console.log('[AUTOMIRI] Jobs completed.');
}).catch(ex => {
    console.error('[AUTOMIRI] Jobs failed.');
    console.error(ex);
}).finally(async () => {
    if (outerBrowser) {
        await close(outerBrowser);
    }

    setTimeout(() => {
        process.exit(1);
    }, 50000)
})
