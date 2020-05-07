#!/usr/bin/env node

import {ScriptUtils} from "./ScriptUtils";
import AWS from "aws-sdk";
import fs from "fs";
import chunk from "lodash/chunk";
import stream from "stream";
import path from "path";
import {Utils} from "../src/Utils";

const version = require(`${process.cwd()}/package.json`).version;

let serviceName = process.env.SERVICE_NAME;
let deployEnv = process.env.DEPLOY_ENV;
let shortDeployEnv = process.env.DEPLOY_ENV;
let awsProfileName = process.env.AWS_PROFILE;
let cdnBucketName = process.env.CDN_BUCKET;
let cdnBucketBase = process.env.CDN_BUCKET_BASE;
let cdnBaseURL = process.env.CDN_BASE_URL;
let awsRegion = process.env.AWS_REGION;

const getProductInfo = async () => {
    if(!serviceName)
    {
        serviceName = await ScriptUtils.question("What is the name of this service? (Set with envar named SERVICE_NAME)");
    }

    if(!deployEnv)
    {
        deployEnv = (await ScriptUtils.choose("What environment do you want to deploy to? (Set with envar named DEPLOY_ENV)", ["production", "development"])).value;
    }

    shortDeployEnv = deployEnv === "production" ? "prod" : "dev";
    process.env.NODE_ENV = deployEnv;

    if(!awsProfileName)
    {
        const homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        const credsFile = fs.readFileSync(`${homeDir}/.aws/credentials`).toString();

        const profileOptions = credsFile.match(/\[(.+)\]/g).map(profile => {
            return {
                value: profile.replace(/^\[|\]$/g, "")
            };
        });

        awsProfileName = (await ScriptUtils.choose("Which AWS Profile do you want to use? (Set with envar named AWS_PROFILE)", profileOptions)).value
    }

    process.env.AWS_PROFILE = awsProfileName;
    AWS.config.region = awsRegion || "us-west-2"; // This just gives us a default region for getting a list
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: awsProfileName});

    if(!awsRegion)
    {
        const ec2 = new AWS.EC2();
        const regions = await ec2.describeRegions({}).promise();

        const regionOptions = regions.Regions.map(regionInfo => regionInfo.RegionName);

        awsRegion = (await ScriptUtils.choose("Which AWS region do you want to use? (Set with envar named AWS_REGION)", regionOptions)).value;
    }

    process.env.AWS_REGION = awsRegion;
    AWS.config.region = awsRegion;
};

const getCDNInfo = async () => {
    if(!cdnBucketName)
    {
        cdnBucketName = await ScriptUtils.question("What is the name of your S3 CDN bucket? (Set with envar named CDN_BUCKET)");
    }


    if(!cdnBucketBase)
    {
        cdnBucketBase = await ScriptUtils.question("What is the base path for your S3 CDN bucket? (Set with envar named CDN_BUCKET_BASE, leave blank for the root)");
    }


    if(!cdnBaseURL)
    {
        cdnBaseURL = await ScriptUtils.question("What is the base public URL of your S3 CDN bucket? (Set with envar named CDN_BASE_URL)");
    }

    process.env.CDN_BASE_URL = cdnBaseURL;
};

const buildAndDeployCDN = async () => {
    console.log("\n\nBuilding client scripts...");

    await ScriptUtils.executeCommand(`webpack`, ["--mode", deployEnv, "--cdnBaseURL", cdnBaseURL], true);

    console.log("\n\nClient scripts have been built");

    console.log("\n\nUploading files to S3 CDN...\n\n");

    const baseBuildDir = path.normalize(`${process.cwd()}/cdn/${version}`);
    const cdnFiles = await ScriptUtils.recursiveReadDir(baseBuildDir);

    const uploadChunks = chunk(cdnFiles, 5); // Break into chunks of 5 files at a time
    for(const uploadChunk of uploadChunks)
    {
        await Promise.all(uploadChunk.map(async (filename) => {
            const s3 = new AWS.S3();
            const writeStream = new stream.PassThrough();

            const s3KeyName = filename.replace(baseBuildDir, path.join(cdnBucketBase || "", version));

            console.log(`Uploading '${s3KeyName}'...`);

            const uploadPromise = s3.upload({ Bucket: cdnBucketName, ACL: "public-read", Key: s3KeyName, Body: writeStream }).promise();
            const readStream = fs.createReadStream(filename);
            readStream.pipe(writeStream);

            return uploadPromise;
        }));
    }

    console.log("\n\nFinished uploading files to S3 CDN");
};

const createSecrets = async (secretName:string) => {

    const secretID = `${shortDeployEnv}/${serviceName}/${secretName}`;

    const secretsManager = new AWS.SecretsManager();

    let secret;

    try {
        secret = await secretsManager.describeSecret({SecretId: secretID}).promise();
    }
    catch (e) {
    }

    if(!secret)
    {
        if(await ScriptUtils.confirm(`A secret named ${secretName} is missing in AWS Secrets Manager. Do you want to create one?`))
        {
            secret = Utils.generateID(32);
            await secretsManager.createSecret({
                Name: secretID,
                SecretString: secret
            }).promise();
        }
    }
};

const deployLambda = async () => {

    console.log("\n\nBeginning Lambda deployment...");

    await ScriptUtils.executeCommand(`sls`, ["deploy", "--stage", shortDeployEnv, "--profile", awsProfileName], true);
};

ScriptUtils.start(async () => {

    console.log("\n\n");

    await getProductInfo();

    await createSecrets("ENCRYPTION_SECRET");
    await createSecrets("JWT_SECRET");

    await getCDNInfo();

    console.log("Getting ready to deploy with the following settings:\n");
    console.log(`Environment:         ${deployEnv}`);
    console.log(`Service Name:        ${serviceName}`);
    console.log(`Version:             ${version}`);
    console.log(`AWS Profile:         ${awsProfileName}`);
    console.log(`AWS Region:          ${awsRegion}`);
    console.log(`CDN S3 Bucket Base:  ${cdnBucketName}${cdnBucketBase ? `/${cdnBucketBase}` : ""}`);
    console.log(`Public CDN Base URL: ${cdnBaseURL}\n`);

    if(!await ScriptUtils.confirm("Are you sure you want to begin the deployment?"))
    {
        console.error("Aborting deployment");
        ScriptUtils.end();
        return;
    }

    await buildAndDeployCDN();
    await deployLambda();
});