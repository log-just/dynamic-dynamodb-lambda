# Dynamic DynamoDB - lambda
 Use DynamoDB autoscaling with lambda!<br />
 It's [Dynamic DynamoDB](https://github.com/caolan/async)'s lambda version

##### This is not stable yet. so before use, Test it please
##### Any report/suggestion, welcome

### File Structure
* **index.js** - main handler & flow source. using [async](https://github.com/caolan/async)
* **tasks.js** - Detail work sources. using AWS SDK
* **config.js** - capacity scaling rule configuration

### How to use
1. `$ git clone https://github.com/rockeee/dynamic-dynamodb-lambda.git` or download zip
2. `$ npm install` to download npm modules
3. modify **config.json** for your configuration.
  * almost same options with [Dynamic DynamoDB](https://github.com/sebdah/dynamic-dynamodb#basic-usage)
4. deploy to lamda function with your favorite method (ex. [node-lambda](https://www.npmjs.com/package/node-lambda))
5. check lambda function's configuration
  * use **Scheduled Event** in **Event sources**
    * **recommend** - set **rate** to equal with **checkIntervalMin** value at **config.json**
  * set **role** permission
    * for now, `dynamodb:DescribeTable` `dynamodb:DescribeTable` `CloudWatch:getMetricStatistics` required
    * example policy
    ```json
    {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Action": [
                "dynamodb:DescribeTable",
                "dynamodb:UpdateTable",
                "CloudWatch:getMetricStatistics"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Sid": "",
            "Resource": "*",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Effect": "Allow"
        }
    ]
}
```

### Roadmap
* add SNS noti.
