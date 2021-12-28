import * as cdk from 'aws-cdk-lib';
import {GaiaToCalendarStack} from "../stacks";

import {config} from "dotenv";
config();

function checkEnv(name: string, value: string | undefined, suggestion = "Please, fill your .env file!"): asserts value is string {
    if (value == null || value === "") {
        throw Error(`process.env.${name} is empty. ${suggestion}`);
    }
}

const environment = process.env.CDK_ENVIRONMENT || "";
const gaiaUsername = process.env.GAIA_USERNAME || "";
const gaiaPassword = process.env.GAIA_PASSWORD || "";

checkEnv("CDK_ENVIRONMENT", environment);
checkEnv("GAIA_USERNAME", gaiaUsername);
checkEnv("GAIA_PASSWORD", gaiaPassword);

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
    gaiaPassword
});
app.synth();
