import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {buildLambda, buildWebPackLambda} from "../utils";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';

export interface GaiaToCalendarStackProps extends cdk.StackProps {
    gaiaUsername: string,
    gaiaPassword: string
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
            removalPolicy: (tags!.Environment !== 'prod' && tags!.Environment !== 'tst') ? cdk.RemovalPolicy.DESTROY : undefined, // Not recommended for production code
        });

        const cdkLambda = buildLambda(this, "./res/gaia-to-calendar-stack", "gaia-to-calendar", {
            GAIA_USERNAME: props.gaiaUsername,
            GAIA_PASSWORD: props.gaiaPassword,
            DYNAMO_TABLE_NAME: table.tableName,
            PERIOD: "month"
        },"",256,cdk.Duration.minutes(2));

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
