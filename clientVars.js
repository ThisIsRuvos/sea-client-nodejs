'use strict'
// use this method for secret.json

const nconf = require('nconf')

nconf.env().file('secrets.json')
const cognitoIdentityPoolID = nconf.get('cognitoIdentityPoolID')
const keycloakAddress = nconf.get('keycloakAddress')
const clientName = nconf.get('clientName')
const clientSecretKey = nconf.get('clientSecretKey')
const seaBucketKMSKey = nconf.get('seaBucketKMSKey')
const steveOutputBucketQueueUrl = nconf.get('steveOutputBucketQueueUrl')

/* Placeholder for service implementation, using env vars
const cognitoIdentityPoolID = process.env.AWS_COGNITO_IDENTITY_POOL || 'zzz'
const keycloakAddress = process.env.KEYCLOAK_IDENTITY_PROVIDER_URL || 'zzz'
const clientName = process.env.SEA_CLIENT_NAME || 'zzz'
const clientSecretKey = process.env.SEA_CLIENT_SECRET_KEY || 'zzz'
const seaBucketKMSKey = process.env.AWS_SEA_ENCRYPTION_KEY || 'zzz'
const steveOutputBucketQueueUrl = process.env.AWS_STEVE_OUTPUT_BUCKET_SQS_QUEUE_URL || 'zzz'
*/

const APIClient = {
    cognitoIdentityPoolID,
    keycloakAddress,
    clientName,
    clientSecretKey,
    seaBucketKMSKey,
    steveOutputBucketQueueUrl  
}

module.exports = {APIClient}