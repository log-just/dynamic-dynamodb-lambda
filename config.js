module.exports = {
    region : 'us-west-2',
    checkIntervalMin : 5, //check internal - same with lambda function scheduled rate
    tables :
        [
            // if you don't need scaling read or write,
            // set 'increase/decrease_reads/writes_with' to 0
            {
            tableName : 'testTable', //check internal - same with lambda function scheduled rate
            reads_upper_threshold : 90, //read incrase threshold (%)
            reads_lower_threshold : 30, //read decrase threshold (%)
            increase_reads_with : 90, //read incrase amount (%)
            decrease_reads_with : 30, //read decrase amount (%)
            base_reads : 5,          //minimum read Capacity
            writes_upper_threshold : 90, //write incrase amount (%)
            writes_lower_threshold : 40, //write decrase amount (%)
            increase_writes_with : 90, //write incrase amount (%)
            decrease_writes_with : 30, //write incrase amount (%)
            base_writes : 5          //minimum write Capacity
            }
            ,
            {
            tableName : 'testTable2', //check internal - same with lambda function scheduled rate
            reads_upper_threshold : 90, //read incrase threshold (%)
            reads_lower_threshold : 30, //read decrase threshold (%)
            increase_reads_with : 0,//90, //read incrase amount (%)
            decrease_reads_with : 0,//30, //read decrase amount (%)
            base_reads : 3,          //minimum read Capacity
            writes_upper_threshold : 90, //write incrase amount (%)
            writes_lower_threshold : 40, //write decrase amount (%)
            increase_writes_with : 0,//90, //write incrase amount (%)
            decrease_writes_with : 0,//30, //write incrase amount (%)
            base_writes : 3          //minimum write Capacity
            }
            
            //...
        ]
};