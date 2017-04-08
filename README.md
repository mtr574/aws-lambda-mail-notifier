#### Simple AWS Lambda function with SES to send email notifications

#### Motivation

Moving the mail sending service out of the main application

#### Usage
- `yarn install` or `npm install` for AWS SDK and MarkupJS
- OPTIONAL `npm i -g serverless` (not requierd, but an easy way to deploy and test your Lambda)

#### Configuring Lambda

- You should apply IAM role with the following policy example:
```
{
    "Version" : "2012-10-17",
    "Statement" : [
        {
            "Effect" : "Allow",
            "Action" : [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource" : "arn:aws:logs:*:*:*"
        },
        {
            "Effect" : "Allow",
            "Action" : [
                "cloudwatch:PutMetricData"
            ],
            "Resource" : "*"
        },
        {
            "Effect" : "Allow",
            "Action" : [
                "ses:SendEmail"
            ],
            "Resource" : "*"
        },
        {
            "Effect" : "Allow",
            "Action" : [
                "s3:GetObject"
            ],
            "Resource" : "*"
        }
    ]
}
```

#### Explanation

- Template markup substitutions with `MarkupJS`
- `config.js` has parameters to be configure before deploying. You must configure a bucket where templates are hosted.
- Passing parameters has this structure:
```
{
    "name": "John",
    "email": "recipient@email.com",
    "subject": "Spark notification",
    "message": "please login to Spark to see your new message."
}
```
- In `tests/invoke.sh` you can find local invoke with initialized parameters to test the Lambda (using serverless)

#### SES SandBox

- Your default SES service is running in SandBox means every recipient email should be verified first.
- You should request AWS to move you out from SandBox as explained in details [here](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html)


#### Tutorials
- [how-to-use-amazon-ses-api](https://easymail7.com/tutorials/how-to-use-amazon-ses-api/)
