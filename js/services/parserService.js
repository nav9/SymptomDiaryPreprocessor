const ParserService = (function(logger) {

    /**
     * Parses a block of pre-processed text where each line should be a timestamped entry or a comment.
     * @param {string} preprocessedText - The text after transformation by PreprocessorService.
     * @returns {Array<Object>} An array of parsed data objects.
     */
    function parse(preprocessedText) {
        const parsedData = [];
        const lines = preprocessedText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const id = `item-${Date.now()}-${Math.random()}`;

            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
                parsedData.push({ id, type: 'comment', content: trimmedLine.substring(trimmedLine.startsWith('//') ? 2 : 1).trim(), originalLine: trimmedLine });
                continue;
            }

            // Expects format: "YYYY-MM-DDTHH:MM:SS.sssZ data, more data"
            const match = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)\s*(.*)/);

            if (match) {
                const isoDate = match[1];
                const text = match[2];
                const phrases = text
                    .split(/[.,]/)
                    .map(p => p.trim())
                    .filter(p => p.length > 0);

                parsedData.push({ id, type: 'entry', isoDate, phrases, originalLine: trimmedLine });
            } else {
                // If it doesn't match the expected format, it's an error.
                parsedData.push({ id, type: 'error', errorType: 'unrecognized_format', errorMsg: 'Cannot recognize line format. Expected a timestamped entry.', originalLine: trimmedLine });
            }
        }
        return parsedData;
    }

    return { parse };
})(logger);