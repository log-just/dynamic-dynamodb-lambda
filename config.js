module.exports = {
    region : 'us-west-2',
    timeframeMin : 5, // evaluation timeframe (minute)
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
};