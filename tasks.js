var env = { };

exports.init = function(config) {
    env.AWS = require('aws-sdk') // region of Table
    env.AWS.config.update({region: config.region});
    env.db = new env.AWS.DynamoDB(); // dynamoDB object
    env.cloudwatch = new env.AWS.CloudWatch(); // cloudWatch object
    env.checkIntervalMin = config.checkIntervalMin; // used capa check Period
    env.startTime = new Date();
    env.endTime = new Date();
    env.startTime.setTime(env.endTime-(60000*env.checkIntervalMin));
    env.decreaseDailyLimit = 4;
};

exports.getTask_tableDesc = function(tableName, callback) {
    console.log('====== '+tableName+' - 1. tabledesc Task Start======');
    var params = { TableName: tableName };
    env.db.describeTable(params, function(err, data) {
        console.log('====== '+tableName+' - 1. tabledesc get Result======');
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

exports.getTask_consumedReadCapa = function(tableName, callback) {
    console.log('====== '+tableName+' - 2. getConsumedReadCapa Task Start======');
    var params = {
        EndTime: env.endTime, // required 
        MetricName: 'ConsumedReadCapacityUnits', // required 
        Namespace: 'AWS/DynamoDB', //required
        Period: (env.checkIntervalMin*60), // required
        StartTime: env.startTime, // required
        Statistics: [ 'Maximum' ],
        Dimensions: [
        {
            Name: 'TableName', // required
            Value: tableName // required
        }],
        Unit: 'Count'
    };
    env.cloudwatch.getMetricStatistics(params, function(err, data) {
        console.log('====== '+tableName+' - 2. getConsumedReadCapa get Result======');
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'getMetricStatistics(get ConsumedReadCapacityUnits) API failed',
                detail : err.message
            });
        }
        else {
            callback(null,data.Datapoints.length === 0 ? 0 : data.Datapoints[0].Maximum);
        }
    }); 
};

exports.getTask_consumedWriteCapa = function(tableName, callback) {
    console.log('====== '+tableName+' - 3. consumedWriteCapa Task Start======');
    var params = {
        EndTime: env.endTime, // required 
        MetricName: 'ConsumedWriteCapacityUnits', // required 
        Namespace: 'AWS/DynamoDB', //required
        Period: (env.checkIntervalMin*60), // required
        StartTime: env.startTime, // required
        Statistics: [ 'Maximum' ],
        Dimensions: [
        {
            Name: 'TableName', // required
            Value: tableName // required
        }],
        Unit: 'Count'
    };
    env.cloudwatch.getMetricStatistics(params, function(err, data) {
        console.log('====== '+tableName+' - 3. consumedWriteCapa get Result======');
        if (err) {
            callback({
                tableName : tableName,
                code : 'error',
                result : 'getMetricStatistics(get ConsumedWriteCapacityUnits) API failed',
                detail : err.message
            });
        }
        else {
            callback(null,data.Datapoints.length === 0 ? 0 : data.Datapoints[0].Maximum);
        }
    });      
};

exports.getTask_newCapa = function(capa,used,upperThsd,lowerThsd,increseAmt,decreseAmt,base) {
    console.log('====== ??? - 4. calculate Start======');
    
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

exports.setTask_updateTable = function(tableName,readCapa,readUsed,newReadCapa,writeCapa,writeUsed,newWriteCapa,callback) {
    console.log('====== '+tableName+' - 5. tableUpdate Start======');
    var params = {
        TableName: tableName, // required 
        ProvisionedThroughput: {
            ReadCapacityUnits: newReadCapa, /* required */
            WriteCapacityUnits: newWriteCapa /* required */
        }
    };
    env.db.updateTable(params, function(err, data) {
        console.log('====== '+tableName+' - 5. ableUpdate get Result======');
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
                detail : 'read - capacity:'+readCapa+', maxConsumed:'+readUsed+' => changedCapa:'+newReadCapa
                        +' // write - capacity:'+writeCapa+', maxConsumed:'+writeUsed+' => changedCapa:'+newWriteCapa
            });
        }
    });
};