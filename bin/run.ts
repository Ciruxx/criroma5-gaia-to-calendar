import * as cdk from 'aws-cdk-lib';
import {GaiaToCalendarStack} from "../stacks";

import {config} from "dotenv";
config();

function checkEnv(name: string, value: string | undefined | null, suggestion = "Please, fill your .env file!"): asserts value is string {
    if (value == null || value === "") {
        throw Error(`process.env.${name} is empty. ${suggestion}`);
    }
}

const environment = process.env.CDK_ENVIRONMENT || null;
const gaiaUsername = process.env.GAIA_USERNAME || null;
const gaiaPassword = process.env.GAIA_PASSWORD || null;
const period = process.env.PERIOD || null;
const client_id = process.env.GOOGLE_CLIENT_ID || null;
const project_id = process.env.GOOGLE_PROJECT_ID || null;
const auth_uri = process.env.GOOGLE_AUTH_URI || null;
const token_uri = process.env.GOOGLE_TOKEN_URI || null;
const auth_provider_x509_cert_url = process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || null;
const client_secret = process.env.GOOGLE_CLIENT_SECRET || null;
// @ts-ignore
const redirect_uris = process.env.GOOGLE_REDIRECT_URIS || null;

checkEnv("CDK_ENVIRONMENT", environment);
checkEnv("GAIA_USERNAME", gaiaUsername);
checkEnv("GAIA_PASSWORD", gaiaPassword);
checkEnv("GOOGLE_CLIENT_ID", client_id);
checkEnv("GOOGLE_PROJECT_ID", project_id);
checkEnv("GOOGLE_CLIENT_SECRET", client_secret);

const tags = {
    Environment: environment,
    Owner: "Croce Rossa Italiana - Comitato Municipio 5",
    Project: 'Gaia To Calendar'
};

const app = new cdk.App();

const prefix = `gtc-${tags.Environment}`;

new GaiaToCalendarStack(app, `${prefix}-gaiatocalendarstack`, {
    tags: {...tags, Stack: "GaiaToCalendarStack"},
    gaiaUsername,
    gaiaPassword,
    client_id,
    project_id,
    client_secret,
    period,
    auth_uri,
    token_uri,
    auth_provider_x509_cert_url,
    redirect_uris,
});
app.synth();
