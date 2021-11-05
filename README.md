# STEVE External API Client

This repository contains example functions for testing the STEVE External API from a simulated client.  These functions can also be used as a blueprint for your own client development.

By itself, this repository will not be useful. This README is intended as a supplement to the STEVE External API Testing Instructions document, which is shared during the onboarding process for API access.  This README provides guidance for setting up a "stand-in" application to complete the process flow for sending and receiving files.

The STEVE External API service includes a [Swagger UI](https://swagger.io/tools/swagger-ui/) component. Swagger UI provides a browser-based illustration of the available routes, with examples of requests and responses. More importantly, it provides a way to simulate an api client through structured forms connected to live endpoints.  Used in conjunction with client functions provided in this repository, complete end-to-end tests can be performed prior to development. As code is developed, the Swagger functions will work in conjunction with completed code for continued end-to-end testing throughout the development process.

## Prerequisites

In order to take advantage of the example code provided in this repository, use the STEVE External API Testing Instructions document as the primary guide to understand process flows, when to use SWAGGER UI routes, and how the example code fits within those processes.

As stated in the document, client configuration is required for the example code to function. Upon creation of your client resources, the following information will be provided:

- Swagger UI URL
- Client name
- Client secret key
- Keycloak address for authentication
- AWS S3 bucket
- AWS KMS encryption key / alias
- AWS SQS endpoint for new message polling
- AWS Cognito identity pool Id

Use this information to complete your local setup.  Then follow the test document steps to run through the different process flows. 

**NodeJS Setup**

Install NodeJS if not already present (linux examples):

```
apt-get update
apt-get install -y nodejs
```

Check the Node version:

```
node --version
```

If the node version is less than 12, install the `n` package, then upgrade Node:

```
npm install -g n
n latest
```

## Test Setup

Follow the instructions on Github to clone this repository to your development computer.  When complete, it may be necessary to create an empty folder to receive files.  From the root of the repository:

```
mkdir files/inbound
```
*Note: commands in this document assume a Linux host machine or use of a Linux-based command shell.*

Use the above information to populate a secrets file that will be used by the functions in this repository. Create a secrets.json file from the provided example:

```
cp secrets-sample.json secrets.json
```

## Testing

As functions are added to this repo, the process flow will build around the below core functions that interact with AWS.  The transaction and mailbox functions are conducted independently using the SWAGGER UI.

### Sending Files

To send files, use the STEVE web interface to send a file to the destination address aligned with the api client.  Alternatively, use SWAGGER UI and the below commands to perform these functions:

**Open transaction**

Use the SWAGGER UI Open transaction route.

**Send file**

Use a filename from the provided list in the `/files/outbound` folder of this repo or place a desired file in that folder before running the following command:

```
node putClientFile -f <filename> -t <transactionId>
```

**Close transaction / Check status**

Use the SWAGGER UI Close transaction route

### Receiving Files

There are two different methods for receiving files using the API.  Refer to the testing document to fully understand where the below steps fall within the overall process.

**Get incoming file information**

Use either SWAGGER UI mailbox routes or data from the below SQS Queue Monitoring.

**Download the file**

Use the file key ID to download the target file.  The bucket is incorporated in the bearer token.

```
node getClientFile -k <just the id part of the key, not the folders>
```
*Example: node getClientFile -k d6e5c6f7-f537-4cf7-bc3a-3d8f7800969a*

**Mark inbox record READ**

Use the SWAGGER UI Inbox route

### Monitoring for Incoming Files

To monitor for incoming files, open a separate terminal window and run:

```
node s3CreateEventSqsPoller
```

When a file is sent to a mailbox being monitored by this client, a message will be displayed with the command to download the file. 