const {DateTime} = require("luxon");

const {auth, period} = require("./etc/conf");
const {login} = require("./src/auth");
const {scraper} = require("./src/scraper");
const {synchronizer} = require("./src/synchronizer");

async function handle(event, context) {
    let cookies = {
        cookiesession1: "678A3E1CMNOPQRSTV0123456789864AA",
        csrftoken: "EM4kt5FAlAqBvRleSoXE2v3spS2TIxHR",
        sessionid: "bhmg13oeut3ykz574lenz0e6vapdh3k1"
    };
    try {
        cookies = await login(auth.username, auth.password);
    } catch (e) {
        return e;
    }
    console.log(cookies);

    const {cookiesession1, csrftoken, sessionid} = cookies;

    const startDate = DateTime.local().setLocale('it-IT').startOf(period).toISO();
    console.log(startDate);
    const endDate = DateTime.local().setLocale('it-IT').endOf(period).toISO(); //"2022-01-09T00:00:00.000Z"
    console.log(endDate);
    let rows = [];
    try {
        rows = await scraper(startDate, endDate, cookiesession1, csrftoken, sessionid);
    } catch (e) {
        return e;
    }

    try {
        await synchronizer(rows);
    } catch (e) {
        return e;
    }

    return "Daje";
}

module.exports = {
    handle
}
