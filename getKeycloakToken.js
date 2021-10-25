'use strict'

const {decodeToken, idpCredentials} = require('./idpStuff')

async function main() {
    let token
    try {
        token = await idpCredentials()
    
        console.log('RAW TOKEN',token)
        const decodeParts = decodeToken(token)
        console.log('DECODED TOKEN',decodeParts)
    } catch(e) {
        console.log('ERROR GETTING CREDENTIALS FROM KEYCLOAK',e)
    }
}

main()
