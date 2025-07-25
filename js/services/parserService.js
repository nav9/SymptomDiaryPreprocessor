const ParserService = (function(dateParser) {

    function parse(rawFileContent) {
        try {
            const linesWithSemicolonsSplit = [];
            rawFileContent.split('\n').forEach(line => {
                let currentLine = line.trim();
                while(currentLine.includes(';')) {
                    const splitIndex = currentLine.indexOf(';');
                    linesWithSemicolonsSplit.push(currentLine.substring(0, splitIndex + 1).trim());
                    currentLine = currentLine.substring(splitIndex + 1).trim();
                }
                if (currentLine) {
                    linesWithSemicolonsSplit.push(currentLine);
                }
            });

            let currentDate = null;
            const parsedData = [];

            for (const rawLine of linesWithSemicolonsSplit) {
                let line = rawLine.trim();
                if (!line) continue;

                const id = `item-${Date.now()}-${Math.random()}`;

                // 1. Check for comment
                if (line.startsWith('//') || line.startsWith('#')) {
                    parsedData.push({ id, type: 'comment', content: line.substring(line.startsWith('//') ? 2 : 1).trim(), originalLine: rawLine });
                    continue;
                }

                // 2. Check for a line that IS a date
                const potentialDate = dateParser.parseDate(line.replace(/;/g, '').trim());
                if (potentialDate && dateParser.isLineJustDate(line.replace(/;/g, '').trim())) {
                    currentDate = potentialDate;
                    parsedData.push({ id, type: 'date_marker', isoDate: currentDate.toISOString(), originalLine: rawLine });
                    continue;
                }

                // 3. Check for time and data
                const timeDataMatch = dateParser.extractTimeAndText(line);
                if (timeDataMatch && currentDate) {
                    const fullDateTime = new Date(currentDate);
                    fullDateTime.setHours(timeDataMatch.hours, timeDataMatch.minutes, timeDataMatch.seconds, 0);
                    
                    const phrases = timeDataMatch.text
                        .replace(/;$/, '') // Remove trailing semicolon
                        .split(/[.,]/)
                        .map(p => p.trim())
                        .filter(p => p.length > 0);

                    parsedData.push({ id, type: 'entry', isoDate: fullDateTime.toISOString(), phrases, originalLine: rawLine });
                    continue;
                }
                
                // 4. If nothing matches, it's an error
                parsedData.push({ id, type: 'error', errorType: 'unrecognized_format', errorMsg: 'Cannot recognize line format.', originalLine: rawLine });
            }
            return parsedData;
        } catch (e) {
            logger.error('Critical error during parsing', e);
            // In a real app, you might want a more graceful failure
            return [{ id: 'critical', type: 'error', errorType: 'critical_parse_error', errorMsg: 'A critical error occurred while parsing this file.', originalLine: '' }];
        }
    }

    return { parse };
})(DateParser); // Inject date parser utility