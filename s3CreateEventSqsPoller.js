'use strict'

const {Consumer} = require('sqs-consumer');

const { APIClient } = require('./clientVars.js')
const {idpCredentials} = require('./idpStuff')
const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1'

async function refresh() {
    let access_token
    const loginAddress = APIClient.keycloakAddress
    try {
        access_token = await idpCredentials()
        AWS.config.credentials.params.Logins[loginAddress] = access_token
        console.log('Retrieve STEVE access token.')
    } catch(e) {
        console.log('ERROR in REFRESH',e)
    }
    return access_token
}

async function setAWSCredentials() {
    const loginAddress = APIClient.keycloakAddress
    const idp = APIClient.cognitoIdentityPoolID
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: idp,
        Logins: {
            [loginAddress]:'',
        }
    })
    await refresh()

    const STS = new AWS.STS()
    let data1
    try {
        data1 = await STS.getCallerIdentity().promise()
    } catch(e) {
        console.log('getCallerIdentity error',e)
    }
    //console.log('Swap access token for AWS Cognito Credentials:',data1)
    console.log('Swap access token for AWS Cognito Credentials.')
    console.log('Monitor SQS Queue...')
}

async function getFileInfo(getParams) {
    const S3 = new AWS.S3()
    let fileSummary;
    let filename;
    try {
        fileSummary = await S3.headObject(getParams).promise()
        filename = fileSummary.Metadata.filename
        } catch (error) {
        if (error.statusCode === 404) {
            console.log('File Not Found')
        }
    }
    return filename
}

async function main() {

    await setAWSCredentials()

    const app = Consumer.create({
        queueUrl: APIClient.steveOutputBucketQueueUrl,
        handleMessage: async (message) => {
            //console.log('message',message)
            if (typeof message.Body !== "undefined") {
                const deliveryMessage = JSON.parse(JSON.parse(message.Body).Message)

                if (!(deliveryMessage.Records && deliveryMessage.Records.length && deliveryMessage.Records[0].s3)) {
                    console.dir(deliveryMessage, { depth: null, colors: true })
                    return
                }

                const objectKey = deliveryMessage.Records[0].s3.object.key
                const bucketName = deliveryMessage.Records[0].s3.bucket.name
                const clientName = APIClient.clientName

                const fileKey = objectKey.replace(`${clientName}/inbound/`,'')
                const getParams = {
                    Bucket: bucketName,
                    Key: objectKey,
                }
                
                const fileDetails = await getFileInfo(getParams)
                console.log('############### New SQS Message ##################')
                console.log(`New incoming file "${fileDetails}" detected.  To download, use command:`)
                console.log(`node getClientFile -k ${fileKey}`)
                console.log('##################################################')
                console.log('Monitor SQS Queue...')
            } else {
                console.log('Unknown error with file message read')
            }
        }
    });

    app.on('error', async (err) => {
        if (err.message.includes('socket hang up')) {
            console.log('Refresh Credentials')
            await setAWSCredentials()
        } else {
            console.error(err.message)
        }
    });

    app.on('processing_error', (err) => {
        console.log('PROCESSING ERROR!')
        console.log('queueUrl', APIClient.steveOutputBucketQueueUrl)
        console.error(err.message);
    });

    app.start();
}

main()