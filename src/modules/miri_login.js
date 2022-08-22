const { MIRI_LOGIN } = require("./constant");

exports.miriLogin = async function(page) {
    const MIRI_EMAIL = process.env.MIRI_USER_EMAIL;
    const MIRI_PASS = process.env.MIRI_USER_PASS;


    // 로그인 페이지로 이동
    await page.goto(MIRI_LOGIN, { waitUntil: "networkidle2" });

    // 이메일 및 비밀번호 입력
    await page.focus('#user_id');
    await page.keyboard.type(MIRI_EMAIL);
    await page.focus('#pw');
    await page.keyboard.type(MIRI_PASS);

    // 로그인 버튼 클릭
    await page.click('#login_btn', { waitUntil: 'networkidle2' });
}
