const run = require('../bin/run');
// const run = require('../build');

const event = {}
const context = {callbackWaitsForEmptyEventLoop: false};

run.handler(event, context)
    .then(res => console.log(res))
    .catch(err => console.error(err));
