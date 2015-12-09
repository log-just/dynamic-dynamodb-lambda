# Dynamic DynamoDB - lambda
 Use DynamoDB autoscaling with lambda!<br />
 It's [Dynamic DynamoDB](https://github.com/caolan/async)'s lambda version

##### This is not stable yet. so before use, Test it please
##### Any report/suggestion, welcome

## File Structure
* **index.js** - main handler & flow source. using [async](https://github.com/caolan/async)
* **tasks.js** - Detail work sources. using AWS SDK
* **config.js** - capacity scaling rule configuration

## How to use
1. `$ git clone https://github.com/rockeee/dynamic-dynamodb-lambda.git` or download zip
2. `$ npm install` to download npm modules
3. modify **config.json** for your configuration.
  * almost same options with [Dynamic DynamoDB](https://github.com/sebdah/dynamic-dynamodb#basic-usage)
  ```json
  {
    region : 'us-west-2',
    checkIntervalMin : 5, //check internal - same with lambda function scheduled rate
    tables :
        [
            {
            tableName : 'testTable', // table name
            reads_upper_threshold : 90, // read incrase threshold (%)
            reads_lower_threshold : 30, // read decrase threshold (%)
            increase_reads_with : 90, // read incrase amount (%)
            decrease_reads_with : 30, // read decrase amount (%)
            base_reads : 5,          // minimum read Capacity
            writes_upper_threshold : 90, // write incrase amount (%)
            writes_lower_threshold : 40, // write decrase amount (%)
            increase_writes_with : 90, // write incrase amount (%)
            decrease_writes_with : 30, // write incrase amount (%)
            base_writes : 5          // minimum write Capacity
            }
            ,
            {
            tableName : 'testTable2',
            reads_upper_threshold : 90,
            reads_lower_threshold : 30,
            increase_reads_with : 0, // to don't scale up reads
            decrease_reads_with : 0, // to don't scale down reads
            base_reads : 3,
            writes_upper_threshold : 90,
            writes_lower_threshold : 40,
            increase_writes_with : 0, // to don't scale up writes
            decrease_writes_with : 0, // to don't scale down writes
            base_writes : 3
            }
            
            //...
        ]
}
```
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

## Roadmap
* add SNS noti.
