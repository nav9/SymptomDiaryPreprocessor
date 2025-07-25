const ValidatorService = (function() {
    function validate(parsedData) {
        let entries = parsedData.filter(item => item.type === 'entry' || item.type === 'date_marker');
        if (entries.length < 2) return parsedData; // No validation needed for order

        // Determine sort order (descending is common in diaries)
        const isDescending = entries[0].isoDate > entries[1].isoDate;
        
        for (let i = 1; i < entries.length; i++) {
            const currentItem = entries[i];
            const prevItem = entries[i-1];

            const isOutOfOrder = isDescending
                ? currentItem.isoDate > prevItem.isoDate
                : currentItem.isoDate < prevItem.isoDate;

            // Find the original item in the full array to attach the error
            const originalItem = parsedData.find(d => d.id === currentItem.id);
            if (isOutOfOrder) {
                 originalItem.type = 'error';
                 originalItem.errorType = 'out_of_order';
                 originalItem.errorMsg = `This entry appears to be out of order. Expected ${isDescending ? 'older' : 'newer'} date.`;
            } else if (originalItem.errorType === 'out_of_order') {
                // Clear previous error if it's now fixed
                delete originalItem.errorType;
                delete originalItem.errorMsg;
                // It was an error, but now it's okay, so what type should it be?
                // This logic depends on whether it was originally a date_marker or entry.
                // For simplicity, we assume we can revert it to 'entry' if it has phrases.
                originalItem.type = originalItem.phrases ? 'entry' : 'date_marker';
            }
        }
        return parsedData;
    }
    return { validate };
})();
