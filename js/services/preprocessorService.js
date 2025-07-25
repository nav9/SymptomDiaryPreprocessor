/**
 * @file preprocessorService.js
 * @description A service to transform raw, human-readable diary text into a structured,
 * line-by-line timestamped format that the parser can easily handle.
 */
const PreprocessorService = (function(dateParser, logger) {

    /**
     * Main transformation method.
     * @param {string} rawContent - The raw text content from a diary file.
     * @param {number} year - The year associated with this file (e.g., from filename).
     * @returns {{transformedText: string, dateOrder: 'asc'|'desc'}} The processed text and detected date order.
     */
    function transform(rawContent, year) {
        if (!rawContent) {
            return { transformedText: '', dateOrder: 'asc' };
        }

        try {
            // Step 1: Create a structured representation of the lines
            const intermediateData = buildIntermediateStructure(rawContent, year);

            // Step 2: Detect the primary date order
            const dateOrder = detectDateOrder(intermediateData);
            logger.info(`Detected date order for year ${year}: ${dateOrder}`);

            // Step 3: Use the structure to build the final timestamped text
            const transformedText = buildTransformedText(intermediateData);

            return { transformedText, dateOrder };

        } catch (error) {
            logger.error("Critical error during preprocessing.", error);
            // Return raw content on failure to allow user to see the issue
            return { transformedText: rawContent, dateOrder: 'asc' };
        }
    }

    /**
     * Parses raw text into an array of objects representing each line's type and content.
     * @param {string} rawContent - The raw file content.
     * @param {number} year - The year for date context.
     * @returns {Array<Object>} An array like [{type, content, date}, ...].
     */
    function buildIntermediateStructure(rawContent, year) {
        const lines = rawContent.split('\n');
        const structure = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle semicolon-as-newline rule
            const subLines = trimmedLine.split(';').map(l => l.trim()).filter(l => l);

            for (const subLine of subLines) {
                 if (subLine.startsWith('//') || subLine.startsWith('#')) {
                    structure.push({ type: 'comment', content: subLine });
                    continue;
                }

                const potentialDate = dateParser.parseDate(subLine, year);
                if (potentialDate && dateParser.isLineJustDate(subLine)) {
                    structure.push({ type: 'date_marker', date: potentialDate, content: subLine });
                    continue;
                }

                // If it's not a date marker or comment, it's a time entry.
                structure.push({ type: 'time_entry', content: subLine });
            }
        }
        return structure;
    }

    /**
     * Analyzes date markers to determine if they are mostly ascending or descending.
     * @param {Array<Object>} intermediateData - The structured data.
     * @returns {'asc'|'desc'}
     */
    function detectDateOrder(intermediateData) {
        const dateMarkers = intermediateData.filter(item => item.type === 'date_marker').map(item => item.date);
        if (dateMarkers.length < 2) {
            return 'desc'; // Default to descending for diaries
        }

        let ascCount = 0;
        let descCount = 0;
        for (let i = 1; i < dateMarkers.length; i++) {
            if (dateMarkers[i] > dateMarkers[i - 1]) {
                ascCount++;
            } else if (dateMarkers[i] < dateMarkers[i - 1]) {
                descCount++;
            }
        }
        // Descending is a more common diary format, so it gets priority in a tie.
        return ascCount > descCount ? 'asc' : 'desc';
    }

    /**
     * Builds the final string with prepended timestamps.
     * @param {Array<Object>} intermediateData - The structured data.
     * @returns {string} The transformed text content.
     */
    function buildTransformedText(intermediateData) {
        let currentDate = null;
        const transformedLines = [];

        for (const item of intermediateData) {
            if (item.type === 'date_marker') {
                currentDate = item.date;
                continue; // Date markers are consumed and not added to the output.
            }

            if (item.type === 'comment') {
                transformedLines.push(item.content);
                continue;
            }

            if (item.type === 'time_entry') {
                if (!currentDate) {
                    // This is an orphaned time entry, pass it through as is for the parser to flag as an error.
                    transformedLines.push(item.content);
                    continue;
                }
                const timeData = dateParser.extractTimeAndText(item.content);
                if (timeData) {
                    const fullDateTime = new Date(currentDate);
                    fullDateTime.setHours(timeData.hours, timeData.minutes, timeData.seconds, 0);
                    // Prepend the ISO string to the text part of the line.
                    const newLine = `${fullDateTime.toISOString()} ${timeData.text}`;
                    transformedLines.push(newLine);
                } else {
                    // Could not extract time, pass it through for the parser to flag.
                    transformedLines.push(item.content);
                }
            }
        }
        return transformedLines.join('\n');
    }


    return {
        transform
    };
})(DateParser, logger);