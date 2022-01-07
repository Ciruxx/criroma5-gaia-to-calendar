const {DateTime} = require("luxon");
const {Scraper, Root, CollectContent} = require("nodejs-web-scraper");
const _ = require("lodash");
const fs = require("fs");

async function scraper(startDate, endDate, cookiesession1, csrftoken, sessionid) {
    const start = DateTime.fromISO(startDate).toFormat('dd-LL-yyyy');
    const end = DateTime.fromISO(endDate).toFormat('dd-LL-yyyy');

    const config = {
        baseSiteUrl: `https://gaia.cri.it/attivita/calendario/${start}/${end}/`,
        startUrl: `https://gaia.cri.it/attivita/calendario/${start}/${end}/`,
        headers: {
            'authority': ' gaia.cri.it',
            'Cookie': `cookiesession1=${cookiesession1}; csrftoken=${csrftoken}; sessionid=${sessionid}`
        },
        // filePath: './images/',
        // concurrency: 10,//Maximum concurrent jobs. More than 10 is not recommended.Default is 3.
        // maxRetries: 3,//The scraper will try to repeat a failed request few times(excluding 404). Default is 5.
        // logPath: './logs/'//Highly recommended: Creates a friendly JSON for each operation object, with all the relevant data.
    }
    const scraper = new Scraper(config);
    const root = new Root();//The root object fetches the startUrl, and starts the process.

    const row = new CollectContent('tr', {name: 'row'});//"Collects" the text from each H1 element.

    root.addOperation(row);

    await scraper.scrape(root);

    let rows = row.getData();//Will return an array of all article objects(from all categories), each
    const months = getShortMonths();

    rows = rows.map(row => {
        let cleanRowArray = row
            .replace(/\n/g, "") // Remove new lines
            .replace(/ {2}/g, ";") // Do a ; separation
            .replace(/—/g, "-") // Replace strange — char
            .split(';') // Split by ;
            .filter(e => e) // Remove empty string
            .filter(e => !e.match(/^\(/)) // Remove max

        cleanRowArray.shift(); // Ignore first element
        const day = parseInt(cleanRowArray.shift());
        const month = months.indexOf(cleanRowArray.shift().toLowerCase());
        const year = new Date().getFullYear();

        cleanRowArray = cleanRowArray.filter(e => e.length !== 1) // Remove single entries
        const res = [];
        const chunks = _.chunk(cleanRowArray, 6);
        for (const chunk of chunks) {
            res.push({
                day,
                month,
                year,
                start: chunk[0].split('-')[0],
                end: chunk[0].split('-')[1],
                title: chunk[1],
                category: chunk[2],
                booked: chunk[3],
                address: chunk[4],
                place: chunk[5],
            })
        }
        return res;
    })

    // console.log(rows[1]);
    // fs.writeFile('./rows.json', JSON.stringify(rows), () => {})
    return rows
}

function getShortMonths() {
    const months = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(1970, i, 1);
        const shortMonth = date.toLocaleString('it-it', {month: 'short'});
        months.push(shortMonth)
    }
    return months;
}

module.exports = {
    scraper
}
