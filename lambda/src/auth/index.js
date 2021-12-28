const axios = require("axios");
const qs = require('qs');
const setCookie = require('set-cookie-parser');

async function login(username, password) {
    let cookies = {
        cookiesession1: "678A3E1CMNOPQRSTV0123456789864AA",
        csrftoken: "EM4kt5FAlAqBvRleSoXE2v3spS2TIxHR",
        sessionid: "bhmg13oeut3ykz574lenz0e6vapdh3k1"
    };
    const res = await gaiaLogin('get', username, password, cookies, getCookiesString(cookies));
    cookies = setCookies(res, cookies);
    const postres = await gaiaLogin('post', username, password, cookies, getCookiesString(cookies));
    return setCookies(postres, cookies)
}

async function gaiaLogin(method, username, password, cookies, cookieString) {
    return axios({
        method,
        url: 'https://gaia.cri.it/login/',
        // xsrfCookieName: 'csrftoken',
        headers: {
            // 'authority': 'gaia.cri.it',
            "Referer": "https://gaia.cri.it/login/",
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieString,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        withCredentials: true,
        data: qs.stringify({
            'csrfmiddlewaretoken': cookies.csrftoken,
            'jorvik_login_view-current_step': 'auth',
            'auth-username': username,
            'auth-password': password,
            'next': ''
        })
    });
}
function setCookies(res, cookies) {
    const rawcookies = setCookie.parse(res);
    for (const cookie of rawcookies) {
        cookies[cookie.name] = cookie.value;
    }
    return cookies;
}

function getCookiesString(cookies){
    let cookieString = "";
    for (const [name, value] of Object.entries(cookies)) {
        cookieString += `${name}=${value}; `
    }
    cookieString = cookieString.substring(0, cookieString.length - 2);
    return cookieString
}
module.exports = {
    login
}
