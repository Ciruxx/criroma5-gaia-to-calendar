const {config} = require("dotenv");
config();

const env = process.env.NODE_ENV || "dev";
const name = "gaia-scraper";

const auth = {
    username: process.env.GAIA_USERNAME || "",
    password: process.env.GAIA_PASSWORD || ""
}
const dynamoTableName = process.env.DYNAMO_TABLE_NAME || "day";
const period = process.env.PERIOD || "day";

module.exports = {
    env,
    name,
    auth,
    dynamoTableName,
    period
};
