# Dynamic DynamoDB - lambda
 Use DynamoDB autoscaling with lambda!<br />
 It's [Dynamic DynamoDB](https://github.com/sebdah/dynamic-dynamodb)'s simple lambda version

##### functional/running test passed. but before use, Test it please
##### please give me any report/suggestion, Welcome

## Feature
* autoscale DynamoDB's provisioned read/write capacity
* run by lambda functon with scheduled event

## File Structure
* **index.js** - main handler & flow source. using [async](https://github.com/caolan/async)
* **tasks.js** - Detail work sources. using AWS SDK
* **config.js** - capacity scaling rule configuration

## How to use
1. `$ git clone https://github.com/rockeee/dynamic-dynamodb-lambda.git` or download zip
2. `$ npm install` to download npm modules
3. modify `config.js` for your configuration.
  * almost same with [Dynamic DynamoDB's option](https://github.com/sebdah/dynamic-dynamodb#basic-usage)
   ```js
  module.exports = {
    region : 'us-west-2', // region
    timeframeMin : 5, // evaluation timeframe (minute)
    tables :
        [
            {
            tableName : 'testTable',     // table name
            reads_upper_threshold : 90,  // read incrase threshold (%)
            reads_lower_threshold : 30,  // read decrase threshold (%)
            increase_reads_with : 90,    // read incrase amount (%)
            decrease_reads_with : 30,    // read decrase amount (%)
            base_reads : 5,              // minimum read Capacity
            writes_upper_threshold : 90, // write incrase amount (%)
            writes_lower_threshold : 40, // write decrase amount (%)
            increase_writes_with : 90,   // write incrase amount (%)
            decrease_writes_with : 30,   // write incrase amount (%)
            base_writes : 5              // minimum write Capacity
            }
            ,
            {
            tableName : 'testTable2',
            reads_upper_threshold : 90,
            reads_lower_threshold : 30,
            increase_reads_with : 0,     // to don't scale up reads
            decrease_reads_with : 0,     // to don't scale down reads
            base_reads : 3,
            writes_upper_threshold : 90,
            writes_lower_threshold : 40,
            increase_writes_with : 0,    // to don't scale up writes
            decrease_writes_with : 0,    // to don't scale down writes
            base_writes : 3
            }
            // additional table...
        ]
};
```
4. deploy to lamda function with your favorite method (just zip, or use tool like [node-lambda](https://www.npmjs.com/package/node-lambda))
5. check lambda function's configuration
  * memory - 128MB, timeout - 10sec
  * set `Cloudwatch Event Rule` to run your lambda function. for detail, refer [this](https://aws.amazon.com/blogs/aws/new-cloudwatch-events-track-and-respond-to-changes-to-your-aws-resources/)
  * set & attach `role` to lambda function
  * example role policy
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

## Roadmap
* more stable
* add SNS noti when scaled/failed
