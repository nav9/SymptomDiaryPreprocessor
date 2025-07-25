const ValidatorService = (function() {

    /**
     * Validates parsed data for chronological order.
     * @param {Array<Object>} parsedData - The array of parsed data items.
     * @param {'asc'|'desc'} dateOrder - The expected order for different dates.
     * @returns {Array<Object>} The data array with error properties attached if needed.
     */
    function validate(parsedData, dateOrder) {
        const entries = parsedData.filter(item => item.type === 'entry');
        if (entries.length < 2) return parsedData;

        for (let i = 1; i < entries.length; i++) {
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