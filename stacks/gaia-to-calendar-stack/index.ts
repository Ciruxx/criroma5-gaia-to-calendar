import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {buildLambda, buildWebPackLambda} from "../utils";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';

export interface GaiaToCalendarStackProps extends cdk.StackProps {
    gaiaUsername: string,
    gaiaPassword: string,
    client_id: string,
    project_id: string,
    client_secret: string,
    period?: string | null,
    auth_uri?: string | null,
    token_uri?: string | null,
    auth_provider_x509_cert_url?: string | null,
    redirect_uris?: string | null
}

export class GaiaToCalendarStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GaiaToCalendarStackProps) {
        super(scope, id, props);
        const {tags} = props;

        const table = new dynamo.Table(this, `${id}-gaia-to-calendar-table`, {
            billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: "gaiaId",
                type: dynamo.AttributeType.STRING,
            },
            timeToLiveAttribute: "ttl",
            removalPolicy: (tags!.Environment !== 'prod' && tags!.Environment !== 'tst') ? cdk.RemovalPolicy.DESTROY : undefined, // Not recommended for production code
        });

        const cdkLambda = buildLambda(this, "./res/gaia-to-calendar-stack", "gaia-to-calendar", {
            GAIA_USERNAME: props.gaiaUsername,
            GAIA_PASSWORD: props.gaiaPassword,
            DYNAMO_TABLE_NAME: table.tableName,
            PERIOD: (props.period == null) ? "month" : props.period,
            GOOGLE_CLIENT_ID: props.client_id,
            GOOGLE_PROJECT_ID: props.project_id,
            GOOGLE_AUTH_URI: (props.auth_uri == null) ? "https://accounts.google.com/o/oauth2/auth" : props.auth_uri,
            GOOGLE_TOKEN_URI: (props.token_uri == null) ? "https://oauth2.googleapis.com/token" : props.token_uri,
            GOOGLE_AUTH_PROVIDER_X509_CERT_URL: (props.auth_provider_x509_cert_url == null) ? "https://www.googleapis.com/oauth2/v1/certs" : props.auth_provider_x509_cert_url,
            GOOGLE_CLIENT_SECRET: props.client_secret,
            GOOGLE_REDIRECT_URIS: (props.redirect_uris == null) ? JSON.stringify(["urn:ietf:wg:oauth:2.0:oob","http://localhost"]) : props.redirect_uris,
        }, "", 256, cdk.Duration.minutes(2));

        table.grantReadWriteData(cdkLambda);

        const target = new eventsTargets.LambdaFunction(cdkLambda);

        new events.Rule(this, `${cdkLambda.functionName.toLowerCase()}-schedule`, {
            enabled: true,
            schedule: events.Schedule.cron({minute: '0/30'}), // Every 30 minutes
            targets: [target]
        });

        new cdk.CfnOutput(this, `${id}-output`, {
            value: cdkLambda.functionName
        });
    }
}
