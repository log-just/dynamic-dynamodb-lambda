# Dynamic DynamoDB - lambda
 Use DynamoDB autoscaling with lambda!<br />
 It's [Dynamic DynamoDB](https://github.com/sebdah/dynamic-dynamodb)'s simple lambda version

##### functional/running test passed. but before use, Test it please
##### please give us any report/suggestion, Welcome

## What's new ?
* Configuration is now stored in a DynamoDB table
* Improve accuracy by using consumed capacity based on Sum statistics instead of Average statistics ([more about it](#sum))
* CloudFormation stack:
  * Lambda deployment,
  * Rule to execute the function every 5 minute,
  * SNS topic creation to schedule tables on alarm.

## Feature
* Autoscale DynamoDB's provisioned read/write capacity
* Run by lambda function with scheduled event 
* SNS topic creation to schedule tables on alarm (optional)

## File Structure
* **index.js** - main handler & flow source. using [async](https://github.com/caolan/async)
* **tasks.js** - Detail work sources. using AWS SDK
* ~~**config.js** - capacity scaling rule configuration~~

## How to use
1. `$ git clone https://github.com/RedbirdHQ/dynamic-dynamodb-lambda.git` or download zip
2. `$ npm install` to download npm modules
3. Create a "configuration" table in DynamoDB to store increase/decrease information.
  * almost same with [Dynamic DynamoDB's option](https://github.com/sebdah/dynamic-dynamodb#basic-usage)
   ```js
// Table JSON item sample
{
  "app": "dynamicDynamoDB",
  "conf": {
    "region" : "us-east-1",  // region
    "timeframeMin" : 5,      // evaluation timeframe (minute)
    "tables" :
        [
            {
            "tableName" : "testTable",     // table name
            "reads_upper_threshold" : 90,  // read incrase threshold (%)
            "reads_lower_threshold" : 30,  // read decrase threshold (%)
            "increase_reads_with" : 90,    // read incrase amount (%)
            "decrease_reads_with" : 30,    // read decrase amount (%)
            "base_reads" : 5,              // minimum read Capacity
            "writes_upper_threshold" : 90, // write incrase amount (%)
            "writes_lower_threshold" : 40, // write decrase amount (%)
            "increase_writes_with" : 90,   // write incrase amount (%)
            "decrease_writes_with" : 30,   // write incrase amount (%)
            "base_writes" : 5              // minimum write Capacity
            }                              
            ,                              
            {                              
            "tableName" : "testTable2",    
            "reads_upper_threshold" : 90,  
            "reads_lower_threshold" : 30,  
            "increase_reads_with" : 0,     // to don't scale up reads
            "decrease_reads_with" : 0,     // to don't scale down reads
            "base_reads" : 3,              
            "writes_upper_threshold" : 90, 
            "writes_lower_threshold" : 40, 
            "increase_writes_with" : 0,    // to don't scale up writes
            "decrease_writes_with" : 0,    // to don't scale down writes
            "base_writes" : 3
            }
        ]
 }
}
```
4. Zip your Lambda and upload it on Amazon S3

5. Check the CloudFormation stack, adjust your settings and execute it

(6.) Add SNS alert on your table to call the SNS topic on alarm

OR 

4. Deploy to lambda function with your favorite method (just zip, use tool like [node-lambda](https://www.npmjs.com/package/node-lambda))

5. Check lambda function's configuration
  * Memory - 128MB, timeout - 60sec
  * Set `Cloudwatch Event Rule` to run your lambda function. for detail, refer [this](https://aws.amazon.com/blogs/aws/new-cloudwatch-events-track-and-respond-to-changes-to-your-aws-resources/)
  * Set & attach `role` to lambda function
  * Example role policy
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
* More stable
* Add SNS noti when scaled/failed
* Update index capacity on the same scheme


## <a name="sum"></a>Why are we using Sum statistic instead of Average ?
Average based on Sum statistic and timeframe instead of taking directly the AWS average is more accurate. Indeed, as the Amazon CloudWatch Developer Guide specification explains: "the Average statistic for the ThrottledRequests metric is simply 1". So, if the Average statistic are used, and there are ThrottledRequests, the average return by AWS is 1, and there isn't capacity upscale. To avoid this problem, we simply used the Sum statistic, divided by a timeframe ("For the ThrottledRequests metric, use the listed Valid Statistics (either Sum or SampleCount) to see the trend of ThrottledRequests over a specified time period.").
