const ParserService = (function(dateParser, logger) {
    function parse(preprocessedText) {
        const parsedData = [];
        const lines = preprocessedText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const id = `item-${Date.now()}-${Math.random()}`;

            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
                parsedData.push({ id, type: 'comment', content: trimmedLine, originalLine: trimmedLine });
                continue;
            }

            // Expects format: "YYYY-MM-DDTHH:MM:SS.sssZ data, more data"
            const match = trimmedLine.match(/^\[(\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2})\]\s*(.*)/);

            if (match) {
                const [_, year, month, day, hours, minutes, text] = match;
                
                // Attempt to build an ISO string for sorting. It will be null if time is invalid.
                const isoDate = dateParser.buildISOString(year, month, day, hours, minutes);

                const phrases = text.split(/[.,]/).map(p => p.trim()).filter(Boolean);

                parsedData.push({
                    id, type: 'entry',
                    dateParts: { year, month, day },
                    timeParts: { hours, minutes },
                    phrases,
                    isoDate, // Can be null!
                    originalLine: trimmedLine // Store the machine line for now
                });
            } else {
                parsedData.push({ id, type: 'error', errorType: 'unrecognized_format', errorMsg: 'Cannot recognize line format.', originalLine: trimmedLine });
            }
        }
        return parsedData;
    }

    return { parse };
})(DateParser, logger);