# STEVE External API Client

This repository contains example functions for testing the External API from a simulated client.  These functions can also be used as the foundation for client development.

## Test Setup

Create a secrets.json file from the example:

```
cp secrets-sample.json secrets.json
```

Populate this file with values provided for the environment and the api client.

## Testing

As functions are added to this repo, the process flow will build around the below core functions that interact with AWS.  The transaction and mailbox functions are conducted independently using the SWAGGER UI.

### Sending Files

To send files, use the STEVE web interface to send to destination addresses that will be received by the api client.  Alternatively, use SWAGGER UI and the below commands to perform these functions:

**Open transaction**

Use the SWAGGER UI transaction route.

**Send file**

Use a filename from the provided list in the `/files/outbound` folder or place a desired file in that folder before running the following command:

```
node putClientFile -f <filename> -t <transactionId>
```

**Close transaction / Check status**

Use the SWAGGER UI transaction routes

### Receiving Files

**Get incoming file information**

Use either SWAGGER UI mailbox routes or data from the below SQS Queue Monitoring.

**Download the file**

Use the file key ID to download the target file.  The bucket is incorporated in the below commmand.

```
node getClientFile -k <just the name part of the key, not the folders>
```
*Example: node getClientFile -k d6e5c6f7-f537-4cf7-bc3a-3d8f7800969a*

**Mark inbox record read**

Use the SWAGGER UI inbox route

### Monitoring for Incoming Files

To monitor for incoming files, open a separate terminal window and run:

```
node s3CreateEventSqsPoller
```
