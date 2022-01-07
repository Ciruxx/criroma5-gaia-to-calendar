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

const googleCredentials = {
    client_id: process.env.GOOGLE_CLIENT_ID|| "",
    project_id: process.env.GOOGLE_PROJECT_ID || "",
    auth_uri: process.env.GOOGLE_AUTH_URI || "",
    token_uri: process.env.GOOGLE_TOKEN_URI || "",
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uris: JSON.parse(process.env.GOOGLE_REDIRECT_URIS) || []
}
module.exports = {
    env,
    name,
    auth,
    dynamoTableName,
    period,
    googleCredentials
};
