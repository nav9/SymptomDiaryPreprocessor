const ValidatorService = (function() {

    function validate(parsedData, dateOrder) {
        const entries = parsedData.filter(item => item.type === 'entry');
        // Phase 1: Validate individual entries
        for (const item of entries) {
            const h = parseInt(item.timeParts.hours, 10);
            const m = parseInt(item.timeParts.minutes, 10);
            if (h > 23 || h < 0 || m > 59 || m < 0 || isNaN(h) || isNaN(m)) {
                flagError(item, 'invalid_time', `Invalid time value: ${item.timeParts.hours}:${item.timeParts.minutes}`);
            } else if (item.errorType === 'invalid_time') {
                // Clear error if it was fixed
                clearError(item);
            }
        }        
        
        
        // Phase 2: Validate order, but only on entries that are valid so far
        const validEntries = entries.filter(item => !item.errorType && item.isoDate);
        if (validEntries.length < 2) return parsedData;


        for (let i = 1; i < validEntries.length; i++) {
            const currentItem = entries[i];
            const prevItem = entries[i - 1];

            const currentDate = new Date(currentItem.isoDate);
            const prevDate = new Date(prevItem.isoDate);

            // Find the original item in the full dataset to attach errors to
            const originalItemInFullData = parsedData.find(d => d.id === currentItem.id);

            // Check if days are the same
            if (currentDate.toDateString() === prevDate.toDateString()) {
                // If days are the same, time MUST be ascending.
                if (currentDate < prevDate) {
                    flagError(originalItemInFullData, 'out_of_order_time', 'Time is out of order for this day. Times should always be ascending.');
                } else {
                    clearError(originalItemInFullData, 'out_of_order_time');
                }
            } else {
                // Days are different, so check based on the detected dateOrder.
                const isOutOfOrder = (dateOrder === 'desc')
                    ? currentDate > prevDate
                    : currentDate < prevDate;
                
                if (isOutOfOrder) {
                    flagError(originalItemInFullData, 'out_of_order_date', `Date is out of order. The file is primarily in ${dateOrder}ending order.`);
                } else {
                    clearError(originalItemInFullData, 'out_of_order_date');
                }
            }
        }
        return parsedData;
    }

    function flagError(item, type, msg) {
        item.type = 'error';
        item.errorType = type;
        item.errorMsg = msg;
    }

    function clearError(item, type) {
        // Only clear the error if it was the specific type we're checking for.
        if (item.errorType === type) {
            delete item.errorType;
            delete item.errorMsg;
            item.type = 'entry';
        }
    }

    return { validate };
})();