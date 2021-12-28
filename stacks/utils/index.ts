import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as fs from "fs";
import { Construct } from 'constructs';
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export function buildWebPackLambda(scope: Construct, lambdasRoot: string, name: string, environment: any, context = "", memorySize = 128, cdkLambdaLayers: lambda.LayerVersion[] = []) {
    return new lambda.Function(scope, `${name}Lambda${context}`, {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: `index.handler`,
        code: lambda.Code.fromAsset(`${lambdasRoot}/${name}/build`),
        memorySize,
        timeout: cdk.Duration.seconds(10),
        environment,
        layers: cdkLambdaLayers,
        logRetention: RetentionDays.ONE_MONTH
    });
}
export function buildLambda(scope: Construct, lambdasRoot: string, name: string, environment: any, context = "", memorySize = 128, cdkLambdaLayers: lambda.LayerVersion[] = []) {
    let directories = getDirectories(lambdasRoot);
    directories = directories.filter((e: any) => e !== name).filter((e: any) => e !== 'utils'); // Escludi tutto tranne la lambda da caricare e utils
    const lambdaFunction = new lambda.Function(scope, `${name}Lambda${context}`, {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: `./${name}/bin/run.handler`,
        code: lambda.Code.fromAsset(lambdasRoot, {
            exclude: directories
        }),
        memorySize,
        timeout: cdk.Duration.seconds(10),
        environment,
        layers: cdkLambdaLayers,
        logRetention: RetentionDays.ONE_MONTH
    });
    return lambdaFunction
}

function getDirectories(source: fs.PathLike) {
    return fs.readdirSync(source, {withFileTypes: true})
        .filter((dirent: any) => dirent.isDirectory())
        .map((dirent: any) => dirent.name)
}
