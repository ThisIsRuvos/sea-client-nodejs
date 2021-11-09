'use strict'

const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const AWS = require('aws-sdk')
const {idpCredentials} = require('./idpStuff')
const {APIClient} = require('./clientVars.js')
const axios = require('axios')

AWS.config.region = 'us-east-1'

const argv = yargs(hideBin(process.argv))
    .option('messageId', {
        alias: 'm',
        describe: 'The ID of the inbox record to be marked as read',
    })
    .demandOption('messageId')
    .argv

async function refresh() {
    let access_token
    try {
        access_token = await idpCredentials()
        console.log('Retrieving STEVE external API client access token')
    } catch (e) {
        console.log('Failed to retrieve STEVE external API client access token', e)
    }
    return access_token
}

async function main() {
    const {seaBaseUrl} = APIClient
    const messageId = argv.messageId
    const url = `${seaBaseUrl}/inbound/read/${messageId}`

    const token = await refresh()
    const options = {
        url: url,
        method: 'patch',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }

    axios(options)
        .then((response) => {
            console.log(`Successfully marked inbox record as read`)
        })
        .catch((error) => {
            console.log(`Failed to mark inbox record as read`)
            console.log({
                error: error,
                message: error.response.data.message,
                status: error.response.status,
                statusText: error.response.statusText
            })
        })
}

main()
