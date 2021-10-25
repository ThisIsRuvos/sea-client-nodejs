const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AWS = require('aws-sdk')

const argv = yargs(hideBin(process.argv))
    .option('Bucket', {
        alias: 'b',
        describe: 'the bucket emitting notifications',
    })
    .option('TopicArn', {
        alias: 's',
        describe: 'the sns topic to target',
    })
    .option('SEAClientId', {
        alias: 'c',
        describe: 'the SEA client id',
    })
    .demandOption('Bucket')
    .demandOption('TopicArn')
    .demandOption('SEAClientId')
    .argv

async function main() {
    const {Bucket, TopicArn, SEAClientId} = argv
    console.log(Bucket, TopicArn, SEAClientId)

    // probably some value inside of this
    const current = await S3.getBucketNotificationConfiguration().promise()

    // something like this
    const newConfig = {
        Bucket,
        NotificationConfiguration: {
            TopicConfigurations: [
                {
                    TopicArn,
                    Events: [
                        "s3:ObjectCreated:*"
                    ],
                    Filter: {
                        Key: {
                            FilterRules:[{
                                Name: 'prefix',
                                Value: `${SEAClientId}/inbound/`
                            }]
                        }
                    },
                    Id: `${Bucket}-${SEAClientId}`
                }
            ]
        }
    }
    // psuedo code, will not work
    newConfig = current.merge(newConfig)

    console.dir(newConfig, {depth:10})
    const S3 = new AWS.S3()
    const ret = await S3.putBucketNotificationConfiguration(newConfig).promise()
    console.log(ret)
}

main()