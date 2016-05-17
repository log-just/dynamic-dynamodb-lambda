{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Process Dynamic DynamoDB",
  "Resources": {
    "dynamoDB": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
           "S3Bucket": "YOUR BUCKETS", //TO MODIFY
           "S3Key": "KEY/FOLDE.ZIP" //TO MODIFY
       },
       "Handler": "index.handler",
       "Role": {"Fn::GetAtt" : ["lambdaDynamicDynamoDBRole", "Arn"] },
       "Runtime": "nodejs4.3",
       "Timeout": 60
      },
      "DependsOn": [
        "lambdaDynamicDynamoDBRole"
      ]
    },
    "dynamoDBVersion": {
      "Type": "AWS::Lambda::Version",
      "Properties": {
        "Description": "",
        "FunctionName": {
          "Ref": "dynamoDB"
        }
      }
    },
    "dynamoDBAlias": {
      "Type": "AWS::Lambda::Alias",
      "Properties": {
        "FunctionName": {
          "Ref": "dynamoDB"
        },
        "FunctionVersion": {
          "Fn::GetAtt": [
            "dynamoDBVersion",
            "Version"
          ]
        },
        "Name": "YOUR ALIAS" //TO MODIFY
      }
    },
    "eventDynamicDynamoDBRule": {
      "Type": "AWS::Events::Rule",
      "Properties": {
        "Description": "Scheduled Rule for DynamicDynamoDB",
        "ScheduleExpression": "rate(5 minutes)",
        "State": "ENABLED",
        "Targets": [{
          "Arn": { "Fn::GetAtt": ["dynamoDB", "Arn"] },
          "Id": "dynamicDynamoDB"
        }]
      }
    },
    "lambdaDynamicDynamoDBRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ],
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        }
      }
    },
    "lambdaDynamicDynamoDBRolePolicy": {
      "Type": "AWS::IAM::Policy",
      "Properties": {
        "Roles": [{"Ref":"lambdaDynamicDynamoDBRole"}],
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics",
                "cloudwatch:SetAlarmState",
                "sns:GetTopicAttributes",
                "sns:Receive",
                "sns:Subscribe",
                "dynamodb:DescribeReservedCapacity",
                "dynamodb:DescribeReservedCapacityOfferings",
                "dynamodb:DescribeTable",
                "dynamodb:GetItem",
                "dynamodb:ListTables",
                "dynamodb:PurchaseReservedCapacityOfferings",
                "dynamodb:UpdateTable",
                "lambda:AddPermission"
              ],
              "Resource": "*"
            }
          ]
        },
        "PolicyName": "lambdaDynamicDynamoDBRolePolicy"
      }
    },
    "snsDynamicDynamoDBTopic":{
      "Type" : "AWS::SNS::Topic",
      "Properties" : {
        "DisplayName" : "dynamicDynamoDBTopic",
        "Subscription" : [
          {
             "Endpoint" : {"Fn::GetAtt" : ["dynamoDB", "Arn"] },
             "Protocol" : "lambda"
          }
        ],
        "TopicName" : "dynamicDynamoDBTopic"
      }
    },
    "dynamoDBSNSPermission": {
      "DependsOn": [
        "dynamoDB",
        "snsDynamicDynamoDBTopic"
      ],
      "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName": {
          "Fn::GetAtt": [
            "dynamoDB",
            "Arn"
          ]
        },
        "Principal": "sns.amazonaws.com",
        "SourceArn": {
          "Ref": "snsDynamicDynamoDBTopic"
        }
      },
      "Type": "AWS::Lambda::Permission"
    },
    "dynamoDBCronPermission": {
      "DependsOn": [
        "dynamoDB"
      ],
      "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName": {
          "Fn::GetAtt": [
            "dynamoDB",
            "Arn"
          ]
        },
        "Principal": "events.amazonaws.com",
        "SourceArn": { "Fn::GetAtt": ["eventDynamicDynamoDBRule", "Arn"] }
      },
      "Type": "AWS::Lambda::Permission"
    }
  }
}
