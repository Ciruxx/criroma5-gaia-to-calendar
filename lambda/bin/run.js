const {name} = require('../etc/conf');

async function init(context, myBlob) {
    console.log("###################################");
    console.log(`${name.toUpperCase()}`);
    console.log("###################################");

    console.log("Loading main...");
    return require("../index").handle(context, myBlob);
}

module.exports = {
    handler: init
};

