const { default: axios } = require("axios");
const moment = require("moment");

exports.checkReset = async function() {
    const BUS_DATE = process.env.TARGET_BUS_DATE;
    const API_KEY = process.env.REST_DATE_OPENAPI_KEY;

    // BUS_DATE 일 뒤의 날짜
    const targetDate = moment().add(BUS_DATE, 'days');

    // 주말인지 확인
    const targetDay = targetDate.day();
    if (targetDay === 6 || targetDay === 0) {
        return {
            rest: true,
            reason: '주말'
        }
    }

    const res = await axios.get(`http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`, {
        params: {
            serviceKey: API_KEY,
            solYear: targetDate.format('YYYY'),
            solMonth: targetDate.format('MM'),
        }
    });
    
    console.log('res.data');
    console.log(res.data);

    let restDays = [];
    {
        const data = res.data.response.body.items.item;
        if (Array.isArray(data)) {
            // 휴일이 여러개 있는 경우
            restDays = data.filter((value) => value.isHoliday === 'Y')
        } else {
            // 휴일이 한개만 있는 경우
            if (data.isHoliday === 'Y') {
                restDays.push(data);
            }
        }
    }

    // 예약할 날짜가 공휴일인지 확인
    const idx = restDays.findIndex(
        value => `${value.locdate}` === targetDate.format('YYYYMMDD'));

    if (idx !== -1) {
        // 공휴일임
        const day = restDays[idx];
        return {
            rest: true,
            reason: day.dateName,
        }
    }

    return {
        rest: false,
        reason: null,
    }
}
