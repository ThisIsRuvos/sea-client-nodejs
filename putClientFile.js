'use strict'

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AWS = require('aws-sdk')
const fs = require('fs')
const {decodeToken, idpCredentials} = require('./idpStuff')
const { APIClient } = require('./clientVars.js')

AWS.config.region = 'us-east-1'

const argv = yargs(hideBin(process.argv))
    .option('fileName', {
        alias: 'f',
        describe: 'name of the local file in the outbound folder for upload',
    })
    .option('transactionId', {
        alias: 't',
        describe: 'the ID of the transaction for this upload',
    })
    .demandOption('fileName')
    .demandOption('transactionId')
    .argv

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

async function main() {
    const FileName = argv.fileName
    const TransactionId = argv.transactionId
    const loginAddress = APIClient.keycloakAddress
    const idp = APIClient.cognitoIdentityPoolID
    const kmskey = APIClient.seaBucketKMSKey
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: idp,
        Logins: {
            [loginAddress]:'',
        }
    })
    const token = await refresh()
    const seaClientId = decodeToken(token)[1].seaClientId
    const clientS3Bucket = decodeToken(token)[1].clientS3Bucket
    
    const STS = new AWS.STS()
    let data1
    try {
        data1 = await STS.getCallerIdentity().promise()
    } catch(e) {
        console.log('getCallerIdentity error',e)
    }
    console.log('Swap access token for AWS Cognito Credentials.')

    if (data1) {
        const Key = `${seaClientId}/outbound/${TransactionId}`
        const uploadFile = `./files/outbound/${FileName}`
        const readStream = fs.createReadStream(uploadFile)
        const Metadata = {
            AIMSPlatformFileName: FileName,
        };
        const putParams = {
            Bucket: clientS3Bucket,
            Key,
            Body: readStream,
            ServerSideEncryption: 'aws:kms',
            SSEKMSKeyId: kmskey,
            Metadata
        }
        //console.log('Put params: ', putParams)
        const S3 = new AWS.S3()
        try {
            console.log('Uploading file...')
            const data = await S3.upload(putParams, function(err, data) {
                readStream.destroy();              
                if (err) {
                    console.log('Upload error:',err)
                    throw err;
                }
                console.log('File upload complete: ',FileName)
              });
        } catch (e) {
            console.log('Error at upload')
        }    
    }
}

main()