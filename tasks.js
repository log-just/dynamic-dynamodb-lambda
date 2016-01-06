var env = { };

// initialize
exports.init = function(config) {
    env.AWS = require('aws-sdk') // AWS object
    env.AWS.config.update({region: config.region}); // update Region info
    env.db = new env.AWS.DynamoDB(); // dynamoDB object
    env.cloudwatch = new env.AWS.CloudWatch(); // cloudWatch object
    env.timeframeMin = config.timeframeMin; // used capa check Period
    // startTime,endTime for using cloudwatch API
    env.startTime = new Date();
    env.endTime = new Date();
    env.startTime.setTime(env.endTime-(60000*env.timeframeMin));
    env.decreaseDailyLimit = 4;
};

// get Table info
exports.getTask_tableDesc = function(tableName, callback) {
    var params = { TableName: tableName };
    env.db.describeTable(params, function(err, data) {
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'describeTable API failed',
                detail : err.message
            });
        }
        else {
            callback(null,{
                readCapa : data.Table.ProvisionedThroughput.ReadCapacityUnits,
                writeCapa : data.Table.ProvisionedThroughput.WriteCapacityUnits,
                status : data.Table.TableStatus,
                remainDecreaseNum : env.decreaseDailyLimit-data.Table.ProvisionedThroughput.NumberOfDecreasesToday
            });
        }
    });
};

// get Table's consumed ReadCapacity (avg)
exports.getTask_consumedReadCapa = function(tableName, callback) {
    var params = {
        EndTime: env.endTime, // required
        MetricName: 'ConsumedReadCapacityUnits', // required
        Namespace: 'AWS/DynamoDB', //required
        Period: (env.timeframeMin*60), // required
        StartTime: env.startTime, // required
        Statistics: [ 'Average' ],
        Dimensions: [
        {
            Name: 'TableName', // required
            Value: tableName // required
        }],
        Unit: 'Count'
    };
    env.cloudwatch.getMetricStatistics(params, function(err, data) {
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'getMetricStatistics(get ConsumedReadCapacityUnits) API failed',
                detail : err.message
            });
        }
        else {
            callback(null,data.Datapoints.length === 0 ? 0 : data.Datapoints[0].Average);
        }
    });
};

// get Table's consumed WriteCapacity (avg)
exports.getTask_consumedWriteCapa = function(tableName, callback) {
    var params = {
        EndTime: env.endTime, // required
        MetricName: 'ConsumedWriteCapacityUnits', // required
        Namespace: 'AWS/DynamoDB', //required
        Period: (env.timeframeMin*60), // required
        StartTime: env.startTime, // required
        Statistics: [ 'Average' ],
        Dimensions: [
        {
            Name: 'TableName', // required
            Value: tableName // required
        }],
        Unit: 'Count'
    };
    env.cloudwatch.getMetricStatistics(params, function(err, data) {
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'getMetricStatistics(get ConsumedWriteCapacityUnits) API failed',
                detail : err.message
            });
        }
        else {
            callback(null,data.Datapoints.length === 0 ? 0 : data.Datapoints[0].Average);
        }
    });
};

// calculate Capacity to update
exports.getTask_newCapa = function(capa,used,upperThsd,lowerThsd,increseAmt,decreseAmt,base) {
    var rate = (used/capa)*100;
    if ( rate > upperThsd )
    {
        return Math.round(capa+(capa*(increseAmt/100)));
    }
    else if ( rate < lowerThsd )
    {
        return Math.max(Math.round(capa-(capa*(decreseAmt/100))),base);
    }
    else
    {
        return capa;
    }
};

// update Table with now Capacity
exports.setTask_updateTable = function(tableName,readCapa,readUsed,newReadCapa,writeCapa,writeUsed,newWriteCapa,callback) {
    var params = {
        TableName: tableName, // required
        ProvisionedThroughput: {
            ReadCapacityUnits: newReadCapa, /* required */
            WriteCapacityUnits: newWriteCapa /* required */
        }
    };
    env.db.updateTable(params, function(err, data) {
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'updateTable API failed',
                detail : err.message
            });
        }
        else {
            callback({
                tableName : tableName,
                code : 'update',
                result : 'table capacity updated',
                detail : 'read - capacity:'+readCapa+', consumed:'+readUsed+' => changedCapa:'+newReadCapa
                        +' // write - capacity:'+writeCapa+', consumed:'+writeUsed+' => changedCapa:'+newWriteCapa
            });
        }
    });
};