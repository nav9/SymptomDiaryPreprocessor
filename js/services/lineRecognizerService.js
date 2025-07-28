const LineRecognizerService = (function(dateParser, logger) {
    /**
     * Analyzes a single line of text.
     * @param {string} lineText - The text of the line to check.
     * @param {boolean} lastSeenDateIsValid - Context from the previous line.
     * @returns {{type: string, reason?: string}}
     */
    function recognizeLine(lineText, lastSeenDateIsValid) {
        const trimmedLine = lineText.trim();

        if (trimmedLine === '') return { type: 'ok' };
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) return { type: 'comment' };
        
        // Use the full dateParser service to call its methods
        if (dateParser.isLineJustDate(trimmedLine)) return { type: 'date' };

        const timeData = dateParser.extractTimeAndText(trimmedLine);
        if (timeData) {
            if (!lastSeenDateIsValid) return { type: 'error', reason: 'Time entry needs a valid date line (e.g., "21 jul") above it.' };
            if (timeData.error) return { type: 'error', reason: timeData.error };
            return { type: 'time' };
        }
        
        return { type: 'error', reason: 'Unrecognized format. Expected format: "dd mmm" for dates, or "hh:mm text" for entries.' };
    }

    // THIS IS THE FIX: Return an object containing the function.
    return { 
        recognizeLine 
    };

})(DateParser, logger);