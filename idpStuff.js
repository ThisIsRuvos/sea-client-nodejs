const axios = require('axios')
const qs = require('qs')
const { APIClient } = require('./clientVars.js')

const decodeToken = (token) => {
    return token.split('.')
        .map((d) => {
            const data = Buffer.from(d,'base64')
            return data.toString()
        })
        .splice(0,2)
        .map(JSON.parse)
}

const idpCredentials = async () => {
    const { keycloakAddress, clientName, clientSecretKey } = APIClient
    let data
    try {
        data = await axios({
            method:'post',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: `https://${keycloakAddress}/protocol/openid-connect/token`,
            data: qs.stringify({
                'grant_type': 'client_credentials',
                'client_id': clientName,
                'client_secret': clientSecretKey 
            })
        })
        //console.log('Data From idpCredentials', data.data['access_token'])
        return data.data['access_token']
    } catch (e) {
        console.log('ERROR IN idpCredentials',e)
        return 'Credential error'
    }
    
}

module.exports = {
    decodeToken,
    idpCredentials,
}