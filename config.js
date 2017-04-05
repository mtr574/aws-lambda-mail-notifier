'use strict';

var config = {
    "templateBucket": "<BUCKET_NAME>",
    "templateKey": "Templates/Template.html",
    "targetAddress": "mail@mail.com",
    "fromAddress": "Me <mail@mail.com>",
    "defaultSubject": "Email From {{name}}"
}

module.exports = config
