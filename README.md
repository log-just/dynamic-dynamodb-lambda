# Dynamic DynamoDB - lambda
document under construction..

# Any report/suggestion, welcome


# file Structure
* **index.js** - main handler & flow source. using [async](https://github.com/caolan/async)
* **tasks.js** - Detail work sources. using AWS SDK
* **config.js** - capacity scaling rule configuration

# How to use
1. `$ git clone https://github.com/rockeee/dynamic-dynamodb-lambda.git` or download zip
2. `$ npm install` to download npm modules
3. modify **config.json** for your configuration. use almost same options with [Dynamic DynamoDB](https://github.com/sebdah/dynamic-dynamodb#basic-usage)
4. deploy to lamda function with your favorite method (ex. [node-lambda](https://www.npmjs.com/package/node-lambda))
5. check lambda function's configuration
  * 'Event sources' is 'Scheduled Event'. recommend - set rate to equal with checkIntervalMin value at config.json

# Roadmap
* add SNS noti.
