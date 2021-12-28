const {DateTime} = require("luxon");
const md5 = require('md5');
const {getOAuth2Client, createEvent, updateEvent,listEvents} = require("../../lib/calendar");
const cache = require('node-file-cache').create();

async function synchronizer(rows) {
    const oAuth2Client = await getOAuth2Client();

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
            const refs = cache.get(dynamoId);

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
                    cache.expire(dynamoId);
                    await createEventAndSet(oAuth2Client, calendarEvent, dynamoId);
                }
            } else {
                await createEventAndSet(oAuth2Client, calendarEvent, dynamoId);
            }
        }
    }
}

async function createEventAndSet(oAuth2Client, calendarEvent, dynamoId) {
    const res = await createEvent(oAuth2Client, calendarEvent); // TODO ci vuole un database per salvare gli id restituiti, serviranno per le update
    const calendarId = res.data.id;
    cache.set(dynamoId, {
        gaiaId: dynamoId,
        calendarId,
        ttl: calendarEvent.isoEnd,
    });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    synchronizer
}
