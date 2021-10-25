const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AWS = require('aws-sdk')
const axios = require('axios')
const qs = require('qs')
const { v4: uuid } = require('uuid')
const {decodeToken, idpCredentials} = require('./idpStuff')

AWS.config.region = 'us-east-1'

const argv = yargs(hideBin(process.argv))
    .option('bucket', {
        alias: 'b',
        describe: 'the bucket to interact with',
    })
    .demandOption('bucket')
    .argv

async function refresh() {
    let access_token
    try {
        access_token = await idpCredentials()
        AWS.config.credentials.params.Logins['keycloak.steve-dev.ruvos.com/auth/realms/api-users'] = access_token
    } catch(e) {
        console.log('ERROR in REFRESH',e)
    }
    return access_token
}


async function main() {
    const Bucket = argv.bucket

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:f3565459-bc66-4d57-9103-58454546981e',
        Logins: {
            'keycloak.steve-dev.ruvos.com/auth/realms/api-users':'',
        }
    })
    const token = await refresh()
    const seaClientId = decodeToken(token)[1].seaClientId
    const clientS3Bucket = decodeToken(token)[1].clientS3Bucket
    console.log('TOKEN',decodeToken(token)[1])
    console.log('seaClientId',seaClientId)
    console.log('clientS3Bucket',clientS3Bucket)
    
    const STS = new AWS.STS()
    let data1
    try {
        data1 = await STS.getCallerIdentity().promise()
    } catch(e) {
        console.log('getCallerIdentity error',e)
    }
    console.log('data1',data1)

    

    if (data1) {
        const Key = `${seaClientId}/outbound/VICTORY_${uuid()}`
        const putData = {
            Bucket,
            Key,
            Body: "Hello World FROM CHARLES - api-users test",
            ServerSideEncryption: 'aws:kms',
            SSEKMSKeyId: '7220a862-3e8f-4150-bb78-fa461417e764',
        }

        console.log(putData)
        const S3 = new AWS.S3()
        try {
            const data = await S3.putObject(putData).promise()
            console.log(data)
            const getData = {
                Bucket,
                Key,
            }
            const data2 = (await S3.getObject(getData).promise()).Body.toString('utf-8')
            console.log(data2)
        } catch (e) {
            console.log('Error at s3PutObject or get', e)
        }
    
    }
}

main()
