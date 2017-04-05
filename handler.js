'use strict'

var aws = require('aws-sdk')
var ses = new aws.SES()
var s3 = new aws.S3()
var config = require('./config.js')
var mark = require('markup-js')

module.exports.notify = (event, context, callback) => {
    let response = {}

    // Check required parameters
    if (event.email === null) {
        response = {
            statusCode: 500,
            error: 'Missing email address'
        }
        callback(null, response)
    } else if (event.name === null) {
        event.name = event.email
    }

    if (event.subject === null) {
        event.subject = config.defaultSubject
        if (event.subject === null) {
            event.subject = 'Mail from {{name}}'
        }
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
            var templateBody = data.Body.toString()

            // Convert newlines in the message
            if (event.message !== null) {
                event.message = event.message.replace('\r\n', '<br />').replace('\r', '<br />').replace('\n', '<br />')
            }

            // Perform the substitutions
            var subject = mark.up(event.subject, event)
            var message = mark.up(templateBody, event)
            var params = {
                Destination: {
                    ToAddresses: [config.targetAddress]
                },
                Message: {
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8'
                    }
                },
                Source: config.fromAddress,
                ReplyToAddresses: [event.name + '<' + event.email + '>']
            }

            var fileExtension = config.templateKey.split('.').pop()
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
                        error: 'The email could not be sent ' + err
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
