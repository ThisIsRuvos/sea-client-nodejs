'use strict'

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AWS = require('aws-sdk')
const axios = require('axios')
const qs = require('qs')
const fs = require('fs')
const { v4: uuid } = require('uuid')
const {decodeToken, idpCredentials} = require('./idpStuff')
const { APIClient } = require('./clientVars.js')

AWS.config.region = 'us-east-1'

const argv = yargs(hideBin(process.argv))
    .option('key', {
        alias: 'k',
        describe: 'the key ID of the file to download',
    })
    .demandOption('key')
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
    const KeyID = argv.key
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
    //console.log('Swap access token for AWS Cognito Credentials:',data1) 
    console.log('Swap access token for AWS Cognito Credentials.')

    if (data1) {
        const Key = `${seaClientId}/inbound/${KeyID}`
        const getParams = {
            Bucket: clientS3Bucket,
            Key,
        }
        const S3 = new AWS.S3()
        // first get header info for file name
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
        let file
        try {
            file = fs.createWriteStream(`./files/inbound/${filename}`);
        } catch (e) {
            console.log('Error at create stream', e)
        }
        if (typeof file!== "undefined") {
            console.log('Downloading file...')
            try {
                await S3.getObject(getParams).createReadStream().pipe(file);
                console.log(`File download complete: ${filename}`)
            } catch (e) {
                console.log('Error at s3GetObject', e)
            }

        }
    
    }
}

main()