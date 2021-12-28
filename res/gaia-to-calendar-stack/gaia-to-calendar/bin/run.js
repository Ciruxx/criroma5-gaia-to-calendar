const {name} = require('../etc/conf');
const main = require("../index");

async function init(event, context) {
    console.log("###################################");
    console.log(`${name.toUpperCase()}`);
    console.log("###################################");

    console.log("Loading main...");
    return main.handle(event, context);
}

module.exports = {
    handler: init
};

