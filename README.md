# SEA Cognito API Client

Functions for testing the External API from a simulated client.  The default setup is intended to work with the Deployed Development environment.

## Test Setup

Create a client using the SEA routes and enter the provided credentials in the `secrets.json` file. 

The default values for cognitoIdentityPoolID and keycloakAddress are for Deployed Dev.

The `seaBucketKMSKey` is initially common for all clients but will eventually be client specific.

## Testing

As functions are added to this repo, the process flow will build around the below core functions that interact with AWS.  The transaction and mailbox functions are conducted independently using the SWAGGER UI.

### Sending Files

To send files, use the SWAGGER UI and the below commands to perform these functions:

**Open transaction**

SWAGGER UI transaction route

**Send file**

Use a filename from the provided list in the `/files/outbound` folder
```
node putClientFile -f <filename> -t <transactionId>
```

**Close transaction / Check status**

SWAGGER UI transaction routes

### Receiving Files

**Get incoming file information**

From SWAGGER UI mailbox routes or Queue Monitoring

**Download the file**

*this will just log object contents to start off-> moving to a real file in local inbound folder* 
```
node getClientFile -k <just the name part of the key, not the folders>
```
*Test: node getClientFile -k TestInbound_d6e5c6f7-f537-4cf7-bc3a-3d8f7800969a*

**Mark inbox record read**

SWAGGER UI inbox route

### Monitoring for Incoming Files

In a separate terminal window:

```
node s3CreateEventSqsPoller
```

## To do

Change from streaming and logging objects to using file in the inbound and outbound folders of this repository.  

## Reference

https://docs.google.com/document/d/1s2R1C_PlXDMjYcJF2PA-Q56za7JMnJPhbMdBOx5Nw20/edit

[testing notes](https://docs.google.com/document/d/1n-XfhAKgjtdhCRXg2nnrtAZZKs3tje65sZlGyA5cmZM)