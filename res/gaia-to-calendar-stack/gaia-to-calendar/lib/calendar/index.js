const {google} = require("googleapis");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function getOAuth2Client(client_id, project_id, auth_uri, token_uri, auth_provider_x509_cert_url, client_secret, redirect_uris) {
    const credentials = {
        installed: {
            client_id,
            project_id,
            auth_uri,
            token_uri,
            auth_provider_x509_cert_url,
            client_secret,
            redirect_uris,
        }
    };

    return authorize(credentials)
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
async function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    let token = null;
    try {
        token = await readfile(TOKEN_PATH)
    } catch (e) {
        return await getAccessToken(oAuth2Client);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
async function getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                globalToken = token;
                resolve(oAuth2Client);
            });
        });
    })

}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth,timeMin) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
        calendarId: 'primary',
        timeMin,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
                console.log(event);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}


async function updateEvent(auth, {eventId, summary, location, description, isoStart, isoEnd}) {
    console.log("UPDATE EVENT");
    console.log(eventId);
    // Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.
    const event = {
        summary,
        location,
        description,
        'start': {
            'dateTime': isoStart
        },
        'end': {
            'dateTime': isoEnd, //TODO Alcuni eventi potrebbero finire il giorno dopo!
        },
        'reminders': {
            'useDefault': true
        },
    };

    // console.log(event)
    const calendar = google.calendar({version: 'v3', auth});

    return calendar.events.patch({
        auth,
        calendarId: 'primary',
        eventId
    })
}

async function createEvent(auth, {summary, location, description, isoStart, isoEnd}) {
    console.log("CREATE EVENT");
    // Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.
    const event = {
        summary,
        location,
        description,
        'start': {
            'dateTime': isoStart
        },
        'end': {
            'dateTime': isoEnd, //TODO Alcuni eventi potrebbero finire il giorno dopo!
        },
        'reminders': {
            'useDefault': true
        },
    };

    const calendar = google.calendar({version: 'v3', auth});

    const res = await calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
    });
    // console.log('Event created:');
    // console.log(res);
    return res;
}

async function readfile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, content) => {
            if (err) return reject(err);
            // Authorize a client with credentials, then call the Google Calendar API.
            resolve(content);
        });
    })
}

module.exports = {
    getOAuth2Client,
    authorize,
    createEvent,
    listEvents,
    updateEvent
}
