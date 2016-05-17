'use strict';

function dynamicDynamoDB(config, callbackReturn){
    var async = require("async");
    var tasks = require('./tasks.js');
    tasks.init(config);

    var result_failed = [];
    var result_updated = [];
    var result_passed = [];

    async.each(config.tables,function(item,callback_outer){
        async.waterfall([

            // 1. get Data by AWS API
            function(callback){
                async.parallel([
                    function(callback_inner){ tasks.getTask_tableDesc(item.tableName, callback_inner); },
                    function(callback_inner){ tasks.getTask_consumedReadCapa(item.tableName, callback_inner) },
                    function(callback_inner){ tasks.getTask_consumedWriteCapa(item.tableName, callback_inner) },
                ],
                //callback_inner - PARALLEL
                function(err, results) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        var readCapa = results[0].readCapa;
                        var readUsed = results[1];
                        var writeCapa = results[0].writeCapa;
                        var writeUsed = results[2];
                        var status = results[0].status;
                        var remainDecreaseNum = results[0].remainDecreaseNum;

                        callback(null,readCapa,readUsed,writeCapa,writeUsed,status,remainDecreaseNum);
                    }
                });
            },

            // 2. calculate new read/write Capacity
            function(readCapa,readUsed,writeCapa,writeUsed,status,remainDecreaseNum,callback){
                if (status !== 'ACTIVE') {
                    callback({
                                tableName : item.tableName,
                                code : 'pass',
                                result : 'status is not ACTIVE'
                            });
                }
                else if (remainDecreaseNum === 0) {
                    callback({
                                tableName : item.tableName,
                                code : 'pass',
                                result : 'Depleted today\'s # of decrease throughput'
                            });
                }
                else {
                    var newReadCapa= tasks.getTask_newCapa(readCapa,readUsed,item.reads_upper_threshold,item.reads_lower_threshold,item.increase_reads_with,item.decrease_reads_with,item.base_reads);
                    var newWriteCapa= tasks.getTask_newCapa(writeCapa,writeUsed,item.writes_upper_threshold,item.writes_lower_threshold,item.increase_writes_with,item.decrease_writes_with,item.base_writes);
                    if (readCapa === newReadCapa && writeCapa === newWriteCapa) {
                        callback({
                                tableName : item.tableName,
                                code : 'pass',
                                result : 'no need to update Table',
                                detail : 'read - capacity:'+readCapa+', consumed:'+readUsed
                                    +' // write - capacity:'+writeCapa+', consumed:'+writeUsed
                                });
                    }
                    else {
                        callback(null,readCapa,readUsed,newReadCapa,writeCapa,writeUsed,newWriteCapa);
                    }
                }
            },

            // 3. update read/write Capacity by AWS API
            function(readCapa,readUsed,newReadCapa,writeCapa,writeUsed,newWriteCapa,callback){
                tasks.setTask_updateTable(item.tableName,readCapa,readUsed,newReadCapa,writeCapa,writeUsed,newWriteCapa,callback); }
            ],


            // Callback - WATERFALL
            function(result){
                var resultString = result.tableName+' : '+result.result;
                var unhandledString = item.tableName+' :unhandled error';
                if (result.detail)
                {
                    resultString += ' : '+result.detail;
                }

                if (result.code) {
                    switch (result.code) {
                    case 'update':
                        result_updated.push(resultString);
                        break;
                    case 'pass':
                        result_passed.push(resultString);
                        break;
                    case 'error':
                        result_failed.push(resultString);
                        break;
                    default:
                        result_failed.push(unhandledString);
                    }
                }
                else {
                    result_failed.push(unhandledString);
                }
                callback_outer(null);

            }
        );

    }
    ,
    //callback_outer - EACH
    function(err){

        var result_concat = result_failed.concat(result_updated,result_passed);

        if (result_failed.length > 0) {
            callbackReturn(result_concat);
        }
        else {
            callbackReturn(null, result_concat);
        }

    });
}

exports.handler = function(event, context, callback) { 
    var doc = require('dynamo-doc');
    var AWS = require('aws-sdk');
    var dynamodb = new AWS.DynamoDB();
    
    var params = {
      TableName: 'configuration', // Table name
      Key: {
        app: {S: "dynamicDynamoDB"} // Key
      }
    };

	//Load config in Dynamo DB table
    dynamodb.getItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else{
          doc.dynamoToJs(data.Item, function(err, item) {
            var conf = item.conf;
            dynamicDynamoDB(conf, callback);
          });
      }
    });
};