const {DateTime} = require("luxon");
const md5 = require('md5');
const {getOAuth2Client, createEvent, updateEvent, listEvents} = require("../../lib/calendar");
const DynamoDB = require("../../lib/DynamoDB");
const {googleCredentials,dynamoTableName} = require("../../etc/conf");

async function synchronizer(rows, endDate) {
    const {
        client_id,
        project_id,
        auth_uri,
        token_uri,
        auth_provider_x509_cert_url,
        client_secret,
        redirect_uris
    } = googleCredentials;
    const oAuth2Client = await getOAuth2Client(client_id, project_id, auth_uri, token_uri, auth_provider_x509_cert_url, client_secret, redirect_uris);

    for (const row of rows) {
        for (const event of row) {
            await delay(100) // Altrimenti Google blocca le chiamate
            const startHour = parseInt(event.start.split(':')[0]);
            const startMinute = parseInt(event.start.split(':')[1]);
            const endHour = parseInt(event.end.split(':')[0]);
            const endMinute = parseInt(event.end.split(':')[1]);

            const isoStart = DateTime.fromObject({
                year: event.year,
                month: event.month + 1,
                day: event.day,
                hour: startHour,
                minute: startMinute
            }, {zone: "Europe/Rome"})
            let isoEnd = DateTime.fromObject({
                year: event.year,
                month: event.month + 1,
                day: event.day,
                hour: endHour,
                minute: endMinute
            }, {zone: "Europe/Rome"})

            if (isoEnd < isoStart) {
                isoEnd = isoEnd.plus({days: 1});
            }

            let calendarEvent = {
                summary: `${event.title}, ${event.category}`,
                location: event.address,
                description: `
                Volontari: ${event.booked}
                Luogo di riferimento: ${event.place}`,
                isoStart: isoStart.toISO(),
                isoEnd: isoEnd.toISO()
            };

            const dynamoId = md5(`${calendarEvent.summary}${calendarEvent.isoStart}${calendarEvent.isoEnd}`);

            const dynamoRes = await DynamoDB.get({
                TableName : dynamoTableName,
                Key: {
                    gaiaId: dynamoId,
                }
            });
            const refs = dynamoRes.Item;

            if (refs != null) {
                calendarEvent["eventId"] = refs.calendarId;
                let res = null;
                try {
                    res = await updateEvent(oAuth2Client, calendarEvent);
                } catch (e) {
                    res = e;
                }
                console.log(res);
                if (res.status !== 200 || res.data.status === "cancelled") {
                    await createEventAndSet(oAuth2Client, calendarEvent, dynamoId, endDate);
                }
            } else {
                await createEventAndSet(oAuth2Client, calendarEvent, dynamoId, endDate);
            }
        }
    }
}

async function createEventAndSet(oAuth2Client, calendarEvent, dynamoId, endDate) {
    const res = await createEvent(oAuth2Client, calendarEvent);
    const calendarId = res.data.id;

    await DynamoDB.put({
        TableName: dynamoTableName,
        Item: {
            gaiaId: dynamoId,
            calendarId,
            ttl: endDate,
        }
    });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    synchronizer
}
