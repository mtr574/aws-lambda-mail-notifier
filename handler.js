'use strict'

const aws = require('aws-sdk')
const ses = new aws.SES()
const s3 = new aws.S3()
const config = require('./config.js')
const mark = require('markup-js')

module.exports.notify = (event, context, callback) => {
    let response;

    // Check required parameters
    if (event.email === null) {
        response = {
            statusCode: 500,
            error: 'Missing email address'
        }
        callback(null, response)
    } else if (event.name === null) {
        event.name = 'Anonymouse Burner'
    }

    if (event.subject === null) {
        event.subject = config.defaultSubject
    }

    // Email template
    s3.getObject({
        Bucket: config.templateBucket,
        Key: config.templateKey
    }, (err, data) => {
        if (err) {
            response = {
                statusCode: 500,
                error: 'Missing email template'
            }
            callback(null, response)
        } else {
            let templateBody = data.Body.toString()

            // Convert newlines in the message
            if (event.message !== null) {
                event.message = event.message.replace('\r\n', '<br />').replace('\r', '<br />').replace('\n', '<br />')
            } else {
                event.message = 'You have notification from Spark. check in: spark.midburn.org'
            }

            // Perform the substitutions
            let subject = mark.up(event.subject, event)
            let message = mark.up(templateBody, event)
            let params = {
                Destination: {
                    ToAddresses: [event.email]
                },
                Message: {
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8'
                    }
                },
                Source: config.fromAddress,
                ReplyToAddresses: ['spark-no-reply@midburn.org']
            }

            let fileExtension = config.templateKey.split('.').pop()
            if (fileExtension.toLowerCase() === 'html') {
                params.Message.Body = {
                    Html: {
                        Data: message,
                        Charset: 'UTF-8'
                    }
                }
            } else if (fileExtension.toLowerCase() === 'txt') {
                params.Message.Body = {
                    Text: {
                        Data: message,
                        Charset: 'UTF-8'
                    }
                }
            } else {
                response = {
                    statusCode: 500,
                    error: 'Unrecognized template file extension: ' + fileExtension
                }
                callback(null, response)
            }

            ses.sendEmail(params, (err, data) => {
                if (err) {
                    response = {
                        statusCode: 500,
                        error: 'The email could not be sent',
                        reason: err
                    }
                    callback(null, response)
                } else {
                    response = {
                        statusCode: 200
                    }
                    callback(null, response)
                }
            })
        }
    })

    callback(null, response)
}
