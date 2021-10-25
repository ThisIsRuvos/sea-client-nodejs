'use strict'

const {decodeToken, idpCredentials} = require('./idpStuff')
const { APIClient } = require('./clientVars.js')

async function refresh() {
    let access_token
    const loginAddress = APIClient.keycloakAddress
    try {
        access_token = await idpCredentials()
        console.log('Retrieve STEVE access token.')
    } catch(e) {
        console.log('ERROR in REFRESH',e)
    }
    return access_token
}


async function main() {
    try {
        const token = await refresh()
        const {seaClientId,clientS3Bucket,jurisdiction, userId} = decodeToken(token)[1]
        console.log(`Authenticated Client Name: ${seaClientId}`)
        console.log(`Aligned User: ${userId}`)
        console.log(`Jurisdiction: ${jurisdiction}`)
        console.log(`S3 Bucket: ${clientS3Bucket}`)
    } catch (e) {
        console.log('Authetication Error')
    }

}

main()