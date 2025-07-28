const PreprocessorService = (function(dateParser, logger) {
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

                const potentialDateParts = dateParser.parseDayMonth(subLine);
                if (potentialDateParts && dateParser.isLineJustDate(subLine)) {
                    structure.push({ type: 'date_marker', dateParts: { ...potentialDateParts, year }, content: subLine });
                    continue;
                }

                // If it's not a date marker or comment, it's a time entry.
                structure.push({ type: 'time_entry', content: subLine });
            }
        }
        return structure;
    }

    function detectDateOrder(intermediateData) {
        const dateMarkers = intermediateData
            .filter(item => item.type === 'date_marker')
            .map(item => {
                const p = item.dateParts;
                return new Date(p.year, p.month, p.day);
            });
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

    function buildTransformedText(intermediateData) {
        let currentDateParts = null;
        const transformedLines = [];

        for (const item of intermediateData) {
            if (item.type === 'date_marker') {
                currentDateParts = item.dateParts;
                continue; // Date markers are consumed and not added to the output.
            }

            if (item.type === 'comment') {
                transformedLines.push(item.content);
                continue;
            }

            if (item.type === 'time_entry') {
                if (!currentDateParts) {
                    transformedLines.push(item.content); // Orphaned line
                    continue;
                }
                const timeData = dateParser.extractTimeAndText(item.content);
                if (timeData) {
                    // NEW: Prepend date AND time parts for the parser.
                    const { year, month, day } = currentDateParts;
                    const { hours, minutes, text } = timeData;
                    // Create a special, machine-readable line for the parser
                    transformedLines.push(`[${year}-${month}-${day} ${hours}:${minutes}] ${text}`);
                } else {
                    transformedLines.push(item.content); // Not a time entry
                }
            }
        }
        return transformedLines.join('\n');
    }


    return { transform };
})(DateParser, logger);