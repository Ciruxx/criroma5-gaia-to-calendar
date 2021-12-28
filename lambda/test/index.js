const run = require('../bin/run');

const event = {}
const context = {callbackWaitsForEmptyEventLoop: false};

run.handler(event, context)
    .then(res => console.log(res))
    .catch(err => console.error(err));
